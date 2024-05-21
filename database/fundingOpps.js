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


async function readFundOpps(email) {
    const pool = new ConnectionPool(connectionString);
    try {
        // Create a new connection pool
        await pool.connect();

        console.log("Reading rows from the funding_opportunities Table...");
        const resultSet = await pool.request().query(`SELECT * FROM [funding_opportunities] WHERE approved = 1 AND end_date >= CAST(GETDATE() AS DATE) AND fund_manager_email != '${email}';`);

        // Close the connection pool
        await pool.close();

        return resultSet.recordset;
    } catch (err) {
        await pool.close();
        console.error(err.message);
        throw err; // Re-throw the error to handle it in the caller
    }
}

async function readFundOppsForFM(email) {
    // Create a new connection pool
    const pool = new ConnectionPool(connectionString);
    try {
        
        await pool.connect();

        console.log("Reading rows from the funding_opportunities Table...");
        // console.log(email);
        const resultSet = await pool.request().query(`SELECT * FROM [funding_opportunities] WHERE approved = 1 AND end_date >= CAST(GETDATE() AS DATE) and fund_manager_email = '${email}';`);

        // console.log(resultSet.recordset);

        // Close the connection pool
        await pool.close();

        return resultSet.recordset;
    } catch (err) {
        await pool.close();
        console.error(err.message);
        throw err; // Re-throw the error to handle it in the caller
    }
}

async function insertFundingOpp(object) {
    // Create a new connection pool
    const pool = new ConnectionPool(connectionString);
    try {
        await pool.connect();

        console.log("Inserting data...");

        // Insert the row into the table
        const resultSet = await pool.request().query(`
        INSERT INTO funding_opportunities (title, summary, description, created_at, approved, fund_manager_email, end_date, type, amount)
        SELECT * FROM (
            SELECT 
                '${object.title}' AS title, 
                '${object.summary}' AS summary, 
                '${object.description}' AS description, 
                GETDATE() AS created_at, -- Assuming you want the current timestamp for created_at
                1 AS approved,
                '${object.fund_manager_email}' AS fund_manager_email, -- Assuming this value is available in 'object'
                '${object.end_date}' AS end_date, -- Assuming this value is available in 'object'
                '${object.type}' AS type, -- Assuming this value is available in 'object'
                '${object.amount}' AS amount -- Assuming this value is available in 'object'
        ) AS tmp
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
        }else returnObj.message = "Object already exists in the database";

        console.log(returnObj);
        return returnObj;
    } catch (err) {
        await pool.close();
        console.error(err.message);
        throw err; // Re-throw the error to handle it in the caller
    }
}

async function updateFundingOpp(object) {
    // Create a new connection pool
    const pool = new ConnectionPool(connectionString);
    try {
        await pool.connect();

        console.log("Updating data...");

        // Update the row in the table
        const resultSet = await pool.request().query(`
            UPDATE funding_opportunities
            SET 
                title = '${object.title}',
                summary = '${object.summary}',
                type = '${object.type}',
                amount = '${object.amount}'
            WHERE 
                id = ${object.id};
        `);

        // Close the connection pool
        await pool.close();

        let returnObj = { message: "Failure" };

        if (resultSet.rowsAffected[0] == 1) {
            returnObj.message = "Success";
        } else {
            returnObj.message = "Object does not exist in the database";
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
    insertFundingOpp,
    readFundOppsForFM,
    updateFundingOpp,
    readFundOpps
};
