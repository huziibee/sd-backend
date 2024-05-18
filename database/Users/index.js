// index.js
const { ConnectionPool } = require('mssql');
const config = require('../config.js');

async function readerUserData(userID) {
    try {
        const pool = new ConnectionPool(config.connectionString);
        await pool.connect();
        const result = await pool.request().query(`select profile_pic_url, user_type from [User] where email = '${userID}'`);
        await pool.close();
        return result.recordset[0];
    } catch (err) {
        console.error(err.message);
        throw err;
    }
}

async function insertUserData(email, profilePicUrl) {
    try {
        const pool = new ConnectionPool(config.connectionString);
        await pool.connect();
        const result = await pool.request().query(`
            INSERT INTO [User] (email, profile_pic_url, user_type, created_at)
            VALUES ('${email}', '${profilePicUrl}', 'User', GETDATE())
        `);
        await pool.close();
        return { message: 'Success' };
    } catch (err) {
        console.error(err.message);
        throw err;
    }
}

async function updateUserData(email, profilePicUrl) {
    try {
        const pool = new ConnectionPool(config.connectionString);
        await pool.connect();
        const result = await pool.request().query(`
            UPDATE [User] SET profile_pic_url = '${profilePicUrl}'
            WHERE email = '${email}'
        `);
        await pool.close();
        return { message: 'Success' };
    } catch (err) {
        console.error(err.message);
        throw err;
    }
}

module.exports = { readerUserData, insertUserData, updateUserData };
