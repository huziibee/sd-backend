const {sql , ConnectionPool } = require('mssql');

const connectionString = `Server=tcp:ezezimalidbs.database.windows.net,1433;Initial Catalog=ezezimalidb;Persist Security Info=False;User ID=ezezimali_admin;Password=Ezimal11;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;`;

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

async function insertFundingApp(object) {
    try {
        // Create a new connection pool
        const pool = new ConnectionPool(connectionString);
        await pool.connect();

        console.log("Inserting data...");

        // Insert the row into the table
        const resultSet = await pool.request().query(`
        INSERT INTO fundersApps (applicant_email, justification)
        SELECT applicant_email, justification
        FROM (
            SELECT '${object.email}' AS applicant_email, '${object.justification}' AS justification
        ) AS tmp
        WHERE NOT EXISTS (
            SELECT 1 FROM fundersApps
            WHERE applicant_email = '${object.email}'
              AND justification = '${object.justification}'
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
    insertFundingApp
};
