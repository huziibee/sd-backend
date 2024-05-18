const { ConnectionPool } = require('mssql');
const { connectionString } = require('./config');

async function readapplicationsForFundingOpps(email) {
    const pool = new ConnectionPool(connectionString);
    try {
        await pool.connect();

        console.log("Reading rows from the applicationsForFundingOpps Table...");
        const resultSet = await pool.request().query(`SELECT A.*
        FROM applicationsForFundingOpps A
        JOIN funding_opportunities F ON A.fundingOpp_ID = F.id
        WHERE F.fund_manager_email = '${email}';
        `);

        return resultSet.recordset;
    } catch (err) {
        console.error(err.message);
        throw err;
    } finally {
        await pool.close();
    }
}

async function insertApplicationsForFundingOpps(object) {
    const pool = new ConnectionPool(connectionString);
    try {
        await pool.connect();

        console.log("Inserting data into applicationsForFundingOpps...");

        const resultSet = await pool.request().query(`
        INSERT INTO applicationsForFundingOpps (applicant_email, fundingOpp_ID, applicant_motivation, applicant_documents)
SELECT '${object.applicant_email}', ${object.fundingOpp_ID}, '${object.applicant_motivation}', '${object.applicant_documents}'
WHERE NOT EXISTS (
    SELECT 1
    FROM applicationsForFundingOpps
    WHERE applicant_email = '${object.applicant_email}' AND fundingOpp_ID = ${object.fundingOpp_ID}
);
        `);

        let returnObj = { message: "Failure" };

        if (resultSet.rowsAffected[0] == 1) {
            returnObj.message = "Success";
        }

        console.log(returnObj);
        return returnObj;
    } catch (err) {
        console.error(err.message);
        throw err;
    } finally {
        await pool.close();
    }
}

async function updateApplicationsForFundingOpps(object) {
    const pool = new ConnectionPool(connectionString);
    try {
        await pool.connect();

        console.log("Updating data in applicationsForFundingOpps...");

        const resultSet = await pool.request().query(`UPDATE applicationsForFundingOpps SET status = '${object.status}' WHERE id = ${object.id};`);

        let returnObj = { message: "Failure" };

        if (resultSet.rowsAffected[0] == 1) {
            returnObj.message = "Success";
        }

        console.log(returnObj);
        return returnObj;
    } catch (err) {
        console.error(err.message);
        throw err;
    } finally {
        await pool.close();
    }
}

module.exports = {
    insertApplicationsForFundingOpps,
    readapplicationsForFundingOpps,
    updateApplicationsForFundingOpps
};
