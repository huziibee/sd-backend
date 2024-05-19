const {sql , ConnectionPool } = require('mssql');
const config = require('../config.js');

const { connectionString } = require('../config.js');

async function readerUserData(userID) {
    try {
        // Create a new connection pool
        const pool = new ConnectionPool(connectionString);
        await pool.connect();

        console.log("Reading rows from the Table...");

        // Perform a SELECT query to check if the user exists
const resultSet = await pool.request().query(`
SELECT profile_pic_url, user_type, name
FROM [User]
WHERE email = '${userID}'
`);
let user = null;

// Check if the query returned no rows
if (resultSet.recordset.length === 0) {
// If no rows returned, insert the new user
const insertResult = await pool.request().query(`
    INSERT INTO [User] (email, profile_pic_url, user_type, created_at, disabled)
    VALUES ('${userID}', 'https://cdn-icons-png.freepik.com/256/11419/11419168.png?semt=ais_hybrid', 'Applicant', GETDATE(), 0);
`);

// Check if the insertion was successful
if (insertResult.rowsAffected[0] === 1) {
    console.log("User inserted successfully.");
    
    return { "message": "Success", "profile_pic_url": "https://cdn-icons-png.freepik.com/256/11419/11419168.png?semt=ais_hybrid", "user_type": "Applicant" };
} else {
    console.error("Failed to insert user.");
    user = { "message": "Failure"};
}
} else {

    user = resultSet.recordset[0];
    user.message = "Success";

}




        // Close the connection pool
        await pool.close();

        return user;
    } catch (err) {
        console.error(err.message);
        throw err; // Re-throw the error to handle it in the caller
    }
}

async function readAllUsers() {
    try {
        // Create a new connection pool
        const pool = new ConnectionPool(connectionString);
        await pool.connect();

        console.log("Reading rows from the Table...");

        // Perform a SELECT query to retrieve all users
        const resultSet = await pool.request().query(`
            SELECT *
            FROM [User] where disabled = 0;
        `);

        // Close the connection pool
        await pool.close();

        return resultSet.recordset;
    } catch (err) {
        console.error(err.message);
        throw err; // Re-throw the error to handle it in the caller
    }
}

// async function readerUserData(userID) {
//     try {
//         var poolConnection = await sql.connect(connectionString);

//         console.log("Reading rows from the Table...");
//         var resultSet = await poolConnection.request().query(`select profile_pic_url , user_type  from [User] where email = '${userID}'`);

//         let user = null; 
//         resultSet.recordset.forEach(row => {
//             user = row;
//         });

//         // close connection only when we're certain application is finished
//         await poolConnection.close();

//         return user;
//     } catch (err) {
//         console.error(err.message);
//         throw err; // Re-throw the error to handle it in the caller
//     }
// }

async function insertUserData(email, profile_pic_url) {
    try {
        // Connect to the database

        const poolConnection = await sql.connect(config);

        // console.log("smurf", userExists)

        // Insert the row into the table

        

        console.log("Inserting!!")
        const resultSet = await poolConnection.request().query(`IF NOT EXISTS (SELECT 1 FROM [User] WHERE email = '${email}')
        BEGIN
            INSERT INTO [User] (email, profile_pic_url, user_type, created_at)
            VALUES ('${email}', '${profile_pic_url}', 'Applicant', GETDATE());
        END
        `);

        // Close the connection
        await poolConnection.close();

        let returnObj = null;

        if (resultSet.rowsAffected[0] == 1) {
            returnObj = { "message" : "Success"};
        }else{
            returnObj = { "message" : "Failure"};
        }
        console.log(returnObj)
        return returnObj;        

        
    } catch (err) {
        console.error(err.message);
        throw err; // Re-throw the error to handle it in the caller
    }
}

async function updateUserPfp(email, profile_pic_url) {
    try {
        // Connect to the database

        const poolConnection = await sql.connect(config);


        console.log("Updating!!")
        const resultSet = await poolConnection.request().query(`
        UPDATE [User]
        SET profile_pic_url = '${profile_pic_url}'
        WHERE email = '${email}';`);

        await poolConnection.close();

        let returnObj = null;

        if (resultSet.rowsAffected[0] == 1) {
            returnObj = { "message" : "Success"};
        }else{
            returnObj = { "message" : "Failure"};
        }
        console.log(returnObj)
        return returnObj; 
        
    } catch (err) {
        console.error(err.message);
        throw err; // Re-throw the error to handle it in the caller
    }
}

async function blockUser(email) {
    try {
        // Connect to the database

        const poolConnection = await sql.connect(config);


            console.log("Updating!!")
        const resultSet = await poolConnection.request().query(`
        UPDATE [User]
        SET disabled = 1
        WHERE email = '${email}';`);

        await poolConnection.close();

        let returnObj = null;

        if (resultSet.rowsAffected[0] == 1) {
            returnObj = { "message" : "Success"};
        }else{
            returnObj = { "message" : "Failure"};
        }
        console.log(returnObj)
        return returnObj; 
        
    } catch (err) {
        console.error(err.message);
        throw err; // Re-throw the error to handle it in the caller
    }
}


// insertUserData("fhddbsjkf", "d")
// updateUserData("fhddbdsdsjkf", "f")

module.exports = {
    readerUserData,
    insertUserData,
    blockUser,
    readAllUsers,
    updateUserPfp
};
// module.exports = insertUserData;
