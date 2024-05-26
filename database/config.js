// const connectionString = `Server=tcp:ezezimalidbs.database.windows.net,1433;Initial Catalog=ezezimalidb;Persist Security Info=False;User ID=ezezimali_admin;Password=Ezimal11;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;`;

// const connectionString = `Server=tcp:ezezimali.database.windows.net,1433;Initial Catalog=ezezimali;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;Authentication="Active Directory Default";`;


const connectionString =  `${secrets.CONNECTION_STRING }`;

module.exports = { connectionString };