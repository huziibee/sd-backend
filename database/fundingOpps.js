const {sql , ConnectionPool } = require('mssql');

const { connectionString } = require('./config');

// async function readerUserData(userID) {
//     try {
//         // Create a new connection pool
//         const pool = new ConnectionPool(connectionString);
//         await pool.connect();

//         console.log("Reading rows from the Table...");
//         const resultSet = await pool.request().query(`select profile_pic_url, user_type from [User] where email = '${userID}'`);

//         let user = null;
//         resultSet.recordset.forEach(row => {
//             user = row;
//         });

//         // Close the connection pool
//         await pool.close();

//         return user;
//     } catch (err) {
//         console.error(err.message);
//         throw err; // Re-throw the error to handle it in the caller
//     }
// }


async function readFundOpps() {
    try {
        // Create a new connection pool
        const pool = new ConnectionPool(connectionString);
        await pool.connect();

        console.log("Reading rows from the funding_opportunities Table...");
        const resultSet = await pool.request().query(`SELECT *
        FROM [funding_opportunities]
        WHERE approved = 1 AND end_date >= CAST(GETDATE() AS DATE);
        `);

        // Close the connection pool
        await pool.close();

        return resultSet.recordset;
    } catch (err) {
        console.error(err.message);
        throw err; // Re-throw the error to handle it in the caller
    }
}

async function insertFundingOpp(object) {
    try {
        // Create a new connection pool
        const pool = new ConnectionPool(connectionString);
        await pool.connect();

        console.log("Inserting data...");

        // Insert the row into the table
        const resultSet = await pool.request().query(`
        INSERT INTO funding_opportunities (title, summary, description, approved)
        SELECT * FROM (SELECT '${object.title}' AS title, '${object.summary}' AS summary, '${object.description}' AS description , 1 AS approved) AS tmp
        WHERE NOT EXISTS (
            SELECT 1 FROM funding_opportunities
            WHERE CAST(title AS VARCHAR(MAX)) = '${object.title}'
              AND CAST(summary AS VARCHAR(MAX)) = '${object.summary}'
              AND CAST(description AS VARCHAR(MAX)) = '${object.description}'
        );
        

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




// insertUserData("fhddbsjkf", "d")
// updateUserData("fhddbdsdsjkf", "f")

module.exports = {
    insertFundingOpp,
    readFundOpps
};
