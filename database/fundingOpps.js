const {sql , ConnectionPool } = require('mssql');

const { connectionString } = require('./config');

const pool = new ConnectionPool(connectionString);

async function readFundOpps(fk_tenant_id) {
    try {
        // Create a new connection pool
        await pool.connect();

        console.log("Reading rows from the funding_opportunities Table...");
        const resultSet = await pool.request().query(`SELECT * FROM [funding_opportunities] WHERE approved = 1 AND end_date >= CAST(GETDATE() AS DATE) AND fk_tenant_id != '${fk_tenant_id}';`);

        // Close the connection pool
        await pool.close();

        return resultSet.recordset;
    } catch (err) {
        await pool.close();
        console.error(err.message);
        throw err; // Re-throw the error to handle it in the caller
    }
}

async function readFundOppsForFM(fk_tenant_id) {

    try {
        
        await pool.connect();

        console.log(fk_tenant_id)

        console.log("Reading rows from the funding_opportunities Table...");
        // console.log(email);
        const resultSet = await pool.request().query(`SELECT * FROM [funding_opportunities] WHERE approved = 1 AND end_date >= CAST(GETDATE() AS DATE) and fk_tenant_id = '${fk_tenant_id}';`);

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

    try {
        await pool.connect();

        console.log("Inserting data...");

        console.log(object);

        // Insert the row into the table
        const resultSet = await pool.request().query(`
        INSERT INTO funding_opportunities (title, description, created_at, approved, fk_tenant_id, end_date, type, amount)
        SELECT * FROM (
            SELECT 
                '${object.title}' AS title, 
                '${object.description}' AS description, 
                GETDATE() AS created_at, 
                1 AS approved,
                '${object.fk_tenant_id}' AS fk_tenant_id,   '${object.end_date}' AS end_date,     '${object.type}' AS type,
                '${object.amount}' AS amount) AS tmp
        WHERE NOT EXISTS (
            SELECT 1 FROM funding_opportunities
            WHERE CAST(title AS VARCHAR(MAX)) = '${object.title}'
                AND CAST(description AS VARCHAR(MAX)) = '${object.description}'
        );
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

async function updateFundingOpp(object) {

    try {
        await pool.connect();

        console.log("Updating data...");

        // Update the row in the table
        const resultSet = await pool.request().query(`
            UPDATE funding_opportunities
            SET 
                title = '${object.title}',
                description = '${object.description}',
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
