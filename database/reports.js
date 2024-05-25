const { sql, ConnectionPool } = require('mssql');

const { connectionString } = require('./config');

const pool = new ConnectionPool(connectionString);

async function readReport(fk_tenant_id) {
    try {
        // Create a new connection pool
        await pool.connect();

        console.log("Reading rows from the reports...");
        const resultSet = await pool.request().query(`
        SELECT
    FORMAT(a.created_at, 'dd') + 
        CASE
            WHEN DAY(f.created_at) IN (1, 21, 31) THEN 'st'
            WHEN DAY(f.created_at) IN (2, 22) THEN 'nd'
            WHEN DAY(f.created_at) IN (3, 23) THEN 'rd'
            ELSE 'th'
        END + ' ' +
        FORMAT(f.created_at, 'MMMM') AS date,
    f.amount
FROM
    funding_opportunities f
JOIN
    applicationsForFundingOpps a ON f.id = a.fundingOpp_ID
WHERE 
    f.fk_tenant_id = '${fk_tenant_id}' AND f.approved = 1
    AND a.status = 'Accepted';

        `);


        let returnObj = { message: "Failure" };

        if (resultSet.recordset.length !== 0) {



            const q2 = await pool.request().query(`
            SELECT
            SUM(CASE WHEN afo.status = 'Accepted' THEN 1 ELSE 0 END) AS AcceptedCount,
            SUM(CASE WHEN afo.status = 'Rejected' THEN 1 ELSE 0 END) AS RejectedCount,
            (
                SELECT 
                    CAST(SUM(CAST(REPLACE(amount, 'R', '') AS DECIMAL(18, 2))) AS DECIMAL(18, 2)) 
                FROM 
                    [dbo].[funding_opportunities]
                WHERE 
                    fk_tenant_id = '${fk_tenant_id}'
            ) AS total,
            (
                SELECT 
                    CAST(SUM(CAST(REPLACE(fo.amount, 'R', '') AS DECIMAL(18, 2))) AS DECIMAL(18, 2))
                FROM 
                    [dbo].[funding_opportunities] fo
                JOIN 
                    [dbo].[applicationsForFundingOpps] af ON fo.id = af.fundingOpp_ID
                WHERE 
                    af.status = 'Accepted'
                AND 
                    fo.fk_tenant_id = '${fk_tenant_id}'
            ) AS consumed,
            (
                SELECT 
                    COUNT(*) 
                FROM 
                    [dbo].[funding_opportunities]
                WHERE 
                    fk_tenant_id = '${fk_tenant_id}' AND type = 'Educational'
            ) AS EducationalCount,
            (
                SELECT 
                    COUNT(*) 
                FROM 
                    [dbo].[funding_opportunities]
                WHERE 
                    fk_tenant_id = '${fk_tenant_id}' AND type = 'Business'
            ) AS BusinessCount,
            (
                SELECT 
                    COUNT(*) 
                FROM 
                    [dbo].[funding_opportunities]
                WHERE 
                    fk_tenant_id = '${fk_tenant_id}' AND (type <> 'Educational' AND type <> 'Business')
            ) AS EventsCount
        FROM
            applicationsForFundingOpps afo
        INNER JOIN
            funding_opportunities fo
        ON
            afo.fundingOpp_ID = fo.id
        WHERE
            fo.fk_tenant_id = '${fk_tenant_id}';
        
        
            `);

            returnObj = { message: "Success", report: resultSet.recordset, total: q2.recordset[0].total, consumed: q2.recordset[0].consumed, AcceptedCount: q2.recordset[0].AcceptedCount, RejectedCount: q2.recordset[0].RejectedCount, EducationalCount: q2.recordset[0].EducationalCount, BusinessCount: q2.recordset[0].BusinessCount, EventsCount: q2.recordset[0].EventsCount};
        }

        // Close the connection pool
        await pool.close();
        return returnObj;
    } catch (err) {
        await pool.close();
        console.error(err.message);
        throw err; // Re-throw the error to handle it in the caller
    }
}

module.exports = { readReport };