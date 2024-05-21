const {sql , ConnectionPool } = require('mssql');

const { connectionString } = require('./config');

async function readNotifications(email) {
    try {
        // Create a new connection pool
        const pool = new ConnectionPool(connectionString);
        await pool.connect();

        console.log("Reading rows from the notifications Table...");
        const resultSet = await pool.request().query(`select * from [notifications] where evaluated = 0 AND receiverEmail = '${email}';`);

        // Close the connection pool
        await pool.close();

        return resultSet.recordset;
    } catch (err) {
        console.error(err.message);
        throw err; // Re-throw the error to handle it in the caller
    }
}

async function evaluateNotification(email) {
    try {
        // Create a new connection pool
        const pool = new ConnectionPool(connectionString);
        await pool.connect();

        console.log("Updating data in notifications...");

        // Insert the row into the table
        const resultSet = await pool.request().query(`
        UPDATE notifications
        SET evaluate = 1
        WHERE receiverEmail= '${email}';
        `);

        // Close the connection pool
        await pool.close();

        let returnObj = { message: "Failure" };

        if (resultSet.rowsAffected[0] == 1) {
            returnObj.message = "Success";
        }

        console.log(returnObj);
        return returnObj;
    } catch (err) {
        console.error(err.message);
        throw err; // Re-throw the error to handle it in the caller
    }
}

async function insertNotification(object) {
    try {
        // Create a new connection pool
        const pool = new ConnectionPool(connectionString);
        await pool.connect();

        console.log("Inserting data into notifications...");

        // Insert the row into the table
        const resultSet = await pool.request().query(`
        INSERT INTO notifications (senderEmail, receiverEmail, description)
Values ('${object.senderEmail}', '${object.receiverEmail}', '${object.description}')
        `);

        // Close the connection pool
        await pool.close();

        let returnObj = { message: "Failure" };

        if (resultSet.rowsAffected[0] == 1) {
            returnObj.message = "Success";
        }

        console.log(returnObj);
        return returnObj;
    } catch (err) {
        console.error(err.message);
        throw err; // Re-throw the error to handle it in the caller
    }
}

module.exports = {
  insertNotification, evaluateNotification, readNotifications  
};