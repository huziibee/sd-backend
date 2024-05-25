const { sql, ConnectionPool } = require('mssql');

const { connectionString } = require('./config');

const pool = new ConnectionPool(connectionString);

// admin reads all funding applications
async function readFundApps() {
    try {
        // Create a new connection pool
        await pool.connect();

        console.log("Reading rows from the fundersApps Table...");
        const resultSet = await pool.request().query(`SELECT F.*, U.username AS username
        FROM fundersApps AS F
        JOIN [User] AS U ON F.fk_tenant_id = U.tenant_id
        WHERE F.evaluated = 0;`);

        
        // Close the connection pool
        await pool.close();

        let returnObj = { message: "Failure" };

        if (resultSet.recordset.length !== 0) {
            returnObj.applications = resultSet.recordset;
            returnObj.message = "Success";
        }

        return returnObj;
    } catch (err) {
        await pool.close();
        console.error(err.message);
        throw err; // Re-throw the error to handle it in the caller
    }
}

// apply to be a fund manager 
async function insertFundingApp(object) {

    try {
        // Create a new connection pool
        await pool.connect();

        console.log("Inserting data to fundersApps...");

        // Insert the row into the table
        const resultSet = await pool.request().query(`
        INSERT INTO fundersApps (fk_tenant_id, justification, document)
        SELECT fk_tenant_id, justification, document
        FROM (
            SELECT '${object.fk_tenant_id}' AS fk_tenant_id, '${object.justification}' AS justification, '${object.document}' AS document
        ) AS tmp
        WHERE NOT EXISTS (
            SELECT 1 FROM fundersApps
            WHERE fk_tenant_id = '${object.fk_tenant_id}'
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
        await pool.close();
        console.error(err.message);
        throw err; // Re-throw the error to handle it in the caller
    }
}

// admin evaluates funding applications 
// approve or reject new fund managers

// who u want to update ie email
// the verdict ie Approved or Rejected

async function updateFundingApp(object) {
    try {

        // console.log("Updating fundersApps!!")
        // Create a new connection pool
        await pool.connect();

        // console.log("Updating fundersApps!!")

        // console.log(object.id);

        // Update the row into the table
        const resultSet = await pool.request().query(`UPDATE [fundersApps] SET evaluated = 1 WHERE fk_tenant_id = '${object.id}';`);

        // console.log("fsjb",resultSet);


        // Close the connection pool
        
        let returnObj = { message: "Failure to Evaluate" , "status": "Failure"};
        
        if (resultSet.rowsAffected[0] >0) {
            returnObj.message = "Successfully Evaluated and rejected";
            returnObj.status = "Success";
            
            
            if (object.verdict == 1){
                const response = await pool.request().query(`
                UPDATE [User] SET user_type = 'Fund Manager' WHERE tenant_id = '${object.id}';`);

                if (response.rowsAffected[0] == 1) {
                    returnObj.message = "Successfully Evaluted and approved";

                } else {
                    returnObj.message = "Failed to update user type";
                }
            }


        }
        
        await pool.close();
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
    insertFundingApp,
    readFundApps,
    updateFundingApp
};
