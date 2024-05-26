const {sql , ConnectionPool } = require('mssql');
const config = require('../config.js');

const { connectionString } = require('../config.js');

const { v4: uuidv4 } = require('uuid');
const { generateToken } = require('../../middleware/token.js');
const pool = new ConnectionPool(connectionString);

async function readerUserData(params) {

    try {
        // Create a new connection pool
        await pool.connect();

        // console.log("Reading rows from USER Table...");

        // Perform a SELECT query to check if the user exists
        const resultSet = await pool.request().query(`
            SELECT disabled, username, profile_pic, user_type
            FROM [User]
            WHERE tenant_id = '${params.id}'
        `);

        let user = null;

        // Check if the query returned no rows
        if (resultSet.recordset.length === 0) {
            // If no rows returned, insert the new user
            const insertResult = await pool.request().query(`
                INSERT INTO [User] (tenant_id, profile_pic, username, disabled)
                VALUES ('${params.id}', 'https://cdn-icons-png.freepik.com/256/11419/11419168.png?semt=ais_hybrid',  '${params.name}', 0);
            `);

            if (insertResult.rowsAffected[0] === 1) {
                // console.log("User inserted successfully.");
                user = { 
                    message: "Success", 
                    profile_pic: "https://cdn-icons-png.freepik.com/256/11419/11419168.png?semt=ais_hybrid", 
                    user_type: "Applicant", 
                    username: params.name
                };
            } else {
                // console.error("Failed to insert user.");
                throw new Error("Failed to insert user.");
            }
        } else {
            user = resultSet.recordset[0];
            user.message = "Success";
        }

        const token = generateToken({ id: params.id, role: user.user_type });

        user.token = token;

        return user;
    } catch (err) {
        // console.error(err.message);
        throw err; // Re-throw the error to handle it in the caller
    } finally {
        // Close the connection pool
        if (pool.connected) {
            await pool.close();
        }
    }
}



async function readAllUsers() {
    try {
        // Create a new connection pool
        const pool = new ConnectionPool(connectionString);
        await pool.connect();

        // console.log("Reading rows from the Table...");

        // Perform a SELECT query to retrieve all users
        const resultSet = await pool.request().query(`
            SELECT *
            FROM [User] where user_type != 'Admin';
        `);

        // Close the connection pool
        await pool.close();

        let users = { users: resultSet.recordset, message: "Success" };

        if (resultSet.recordset.length === 0) {
            users = { message: "Failure" };
        }

        return users;
    } catch (err) {
        // console.error(err.message);
        throw err; // Re-throw the error to handle it in the caller
    }
}

// async function insertUserData(email, profile_pic_url) {
//     try {
//         // Connect to the database

//         const poolConnection = await sql.connect(config);

//         // console.log("smurf", userExists)

//         // Insert the row into the table

        

//         console.log("Inserting!!")
//         const resultSet = await poolConnection.request().query(`IF NOT EXISTS (SELECT 1 FROM [User] WHERE email = '${email}')
//         BEGIN
//             INSERT INTO [User] (tenant_id, profile_pic_url, user_type, created_at)
//             VALUES ('${email}', '${profile_pic_url}', 'Applicant', GETDATE());
//         END
//         `);

//         // Close the connection
//         await poolConnection.close();

//         let returnObj = null;

//         if (resultSet.rowsAffected[0] == 1) {
//             returnObj = { "message" : "Success"};
//         }else{
//             returnObj = { "message" : "Failure"};
//         }
//         console.log(returnObj)
//         return returnObj;        

        
//     } catch (err) {
//         console.error(err.message);
//         throw err; // Re-throw the error to handle it in the caller
//     }
// }

async function updateUserPfp(object) {
    try {
        // Connect to the database

        const poolConnection = new ConnectionPool(connectionString);
        await poolConnection.connect();

        // console.log(object)


            // console.log("Updating!!")
        const resultSet = await poolConnection.request().query(`
        UPDATE [User]
        SET profile_pic = '${object.profile_pic}', username = '${object.username}'
        WHERE tenant_id = '${object.id}';`);

        await poolConnection.close();

        let returnObj = null;

        if (resultSet.rowsAffected[0] == 1) {
            returnObj = { "message" : "Success"};
        }else{
            returnObj = { "message" : "Failure"};
        }
        // console.log(returnObj)
        return returnObj; 
        
    } catch (err) {
        // console.error(err.message);
        throw err; // Re-throw the error to handle it in the caller
    }
}

async function blockUser(object) {
    try {
        // Connect to the database

        const poolConnection = new ConnectionPool(connectionString);
        await poolConnection.connect();


            // console.log("Updating!!")
        const resultSet = await poolConnection.request().query(`
        UPDATE [User]
        SET disabled = ${object.disabled}
        WHERE tenant_id = '${object.id}';`);

        await poolConnection.close();

        let returnObj = null;

        if (resultSet.rowsAffected[0] == 1) {
            returnObj = { "message" : "Success"};
        }else{
            returnObj = { "message" : "Failure"};
        }
        // console.log(returnObj)
        return returnObj; 
        
    } catch (err) {
        // console.error(err.message);
        throw err; // Re-throw the error to handle it in the caller
    }
}


// insertUserData("fhddbsjkf", "d")
// updateUserData("fhddbdsdsjkf", "f")

module.exports = {
    readerUserData,
    blockUser,
    readAllUsers,
    updateUserPfp
};
// module.exports = insertUserData;
