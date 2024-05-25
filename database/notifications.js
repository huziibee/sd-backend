const {sql , ConnectionPool } = require('mssql');

const { connectionString } = require('./config');

const pool = new ConnectionPool(connectionString);

async function readNote(id) {

    try {
        
        await pool.connect();

        // console.log("cows")
        // console.log("why2",id)

        // console.log(fk_tenant_id)

        console.log("Reading rows from the notes Table...");
        // console.log(email);
        const resultSet = await pool.request().query(`select * from notifications where reciever_tenant_id = '${id}' and evaluated = 0 and adminRequired = 0;`);

        await pool.close();

        let returnObj = { message: "Failure" };

        if (resultSet.recordset.length !== 0) {
            returnObj = { message: "Success", notifications: resultSet.recordset };
        }

        return returnObj;
    } catch (err) {
        await pool.close();
        console.error(err.message);
        throw err; // Re-throw the error to handle it in the caller
    }
}

async function readAdminnotes() {

    try {
        
        await pool.connect();
        // console.log("moop")

        // console.log(fk_tenant_id)

        console.log("Reading rows from the notes Table...");
        // console.log(email);
        const resultSet = await pool.request().query(`select * from notifications where adminRequired =1 and evaluated = 0;`);

        await pool.close();

        let returnObj = { message: "Failure" };

        if (resultSet.recordset.length !== 0) {
            returnObj = { message: "Success", notifications: resultSet.recordset };
        }

        return returnObj;
    } catch (err) {
        await pool.close();
        console.error(err.message);
        throw err; // Re-throw the error to handle it in the caller
    }
}

async function insertNote(object) {

    try {
        await pool.connect();

        console.log("Inserting note...");

        // console.log(object);

        // Insert the row into the table
        const resultSet = await pool.request().query(`
        INSERT INTO notifications (reciever_tenant_id, adminRequired, title, message, evaluated)
VALUES ('${object.id}', ${object.adminRequired}, '${object.title}', '${object.message}', 0);
    `);
    

        // Close the connection pool
        await pool.close();

        let returnObj = { message: "Failure" };

        if (resultSet.rowsAffected[0] == 1) {
            returnObj.message = "Success";
        }
        return returnObj;
    } catch (err) {
        await pool.close();
        console.error(err.message);
        throw err; // Re-throw the error to handle it in the caller
    }
}

async function insertFundsNote(object) {

    try {
        await pool.connect();

        console.log("Inserting note...");

        // console.log(object);

        const dataaa = await pool.request().query(`
        SELECT fk_tenant_id FROM funding_opportunities where id = ${object.id};
    `);

    const fk_tenant_id = dataaa.recordset[0].fk_tenant_id;

        // Insert the row into the table
        const resultSet = await pool.request().query(`
        INSERT INTO notifications (reciever_tenant_id, adminRequired, title, message, evaluated)
VALUES ('${fk_tenant_id}', 0, '${object.title}', '${object.message}', 0);
    `);
    

        // Close the connection pool
        await pool.close();

        let returnObj = { message: "Failure" };

        if (resultSet.rowsAffected[0] == 1) {
            returnObj.message = "Success";
        }
        return returnObj;
    } catch (err) {
        await pool.close();
        console.error(err.message);
        throw err; // Re-throw the error to handle it in the caller
    }
}

async function updateNotes(object) {

    try {
        await pool.connect();

        console.log("Updating notes...");

        // Update the row in the table
        const resultSet = await pool.request().query(`
            UPDATE notifications
            SET 
                evaluated = 1
            WHERE 
                id = ${object.id};
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
        await pool.close();
        console.error(err.message);
        throw err; // Re-throw the error to handle it in the caller
    }
}



// insertUserData("fhddbsjkf", "d")
// updateUserData("fhddbdsdsjkf", "f")

module.exports = {
    readNote,
    insertNote,
    insertFundsNote,
    updateNotes,
    readAdminnotes  
};
