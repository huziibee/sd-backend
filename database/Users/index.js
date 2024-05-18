const { ConnectionPool } = require('mssql');
const config = require('../config.js');

async function readerUserData(userID) {
    const pool = new ConnectionPool(config.connectionString);
    try {
        await pool.connect();
        const result = await pool.request().query(`select profile_pic_url, user_type from [User] where email = '${userID}'`);
        return result.recordset[0];
    } catch (err) {
        console.error(err.message);
        throw err;
    } finally {
        await pool.close();
    }
}

async function insertUserData(email, profilePicUrl) {
    const pool = new ConnectionPool(config.connectionString);
    try {
        await pool.connect();
        await pool.request().query(`
            INSERT INTO [User] (email, profile_pic_url, user_type, created_at)
            VALUES ('${email}', '${profilePicUrl}', 'User', GETDATE())
        `);
        return { message: 'Success' };
    } catch (err) {
        console.error(err.message);
        throw err;
    } finally {
        await pool.close();
    }
}

async function updateUserData(email, profilePicUrl) {
    const pool = new ConnectionPool(config.connectionString);
    try {
        await pool.connect();
        await pool.request().query(`
            UPDATE [User] SET profile_pic_url = '${profilePicUrl}'
            WHERE email = '${email}'
        `);
        return { message: 'Success' };
    } catch (err) {
        console.error(err.message);
        throw err;
    } finally {
        await pool.close();
    }
}

module.exports = { readerUserData, insertUserData, updateUserData };
