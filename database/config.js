
const config = {
    user: 'ezezimali_admin',
    password: 'Ezimal11',
    server: 'ezezimalidbs.database.windows.net',
    database: 'ezezimalidb', // replace 'your_database_name' with your actual database name
    authentication: {
        type: 'default',
        options: {
            userName: 'ezezimali_admin',
            password: 'Ezimal11'
        }
    },
    options: {
        encrypt: true
    }
};

console.log("Starting...");

module.exports = config;


