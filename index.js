// imports
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const history = require('connect-history-api-fallback');
const applicationsRoute = require('./router/applications');
const applyRoute = require('./router/apply');
const authRoute = require('./router/auth');
const notificationsRoute = require('./router/notifications');
const oppotunitiesRoute = require('./router/oppotunities');
const uploadRoute = require('./router/upload');
const userRoute = require('./router/user');
const reportsRoute = require('./router/reports');

// 

// const authRoute = require('./router/auth');

 
const app = express();
const portt = process.env.PORT || 3019;

// Serve static files from the 'public' folder
app.use(express.static(path.resolve(__dirname, './dist'), { maxAge : '1y', etag: false}));
app.use(history());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

const version = "/api/v1";

app.use(version+'/applications', applicationsRoute);
app.use(version+'/apply', applyRoute);
app.use(version+'/auth', authRoute);
app.use(version+'/notifications', notificationsRoute);
app.use(version+'/oppotunities', oppotunitiesRoute);
app.use(version+'/upload', uploadRoute);
app.use(version+'/user', userRoute);
app.use(version+'/reports', reportsRoute);

// Handle requests that don't match any routes by serving the frontend index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, './dist/index.html'));
});

app.listen( portt, () => {
  console.log(`Example app listening on port ${ portt}`);
});


// const baseurl = process.env.PORT ? "https://ezezimalii.azurewebsites.net/" : 'http://localhost:'+portt;

// const currentDate = new Date();


// const { generateToken, verifyToken } = require('./middleware/token');



// const axios = require('axios'); 
// // Define your authentication token
// const token = generateToken({ userId: "ff2b2187-2920-43ad-adef-2f1f880b9f87", role: 'Applicant' });




// // Define the fetchData function
// async function fetchData() {
//   try {
//     const id = 'ff2b2187-2920-43ad-adef-2f1f880b9f87';

//     const username = 'johndoe';

//     // Modify the axios call to include the token in the request headers
//     // const response = await axios.get(`${baseurl}/api/v1/user`, {
//     //   params: {
//     //     id: id,
//     //     name: username
//     //   }
//     // });
    

//     // console.log(response.data); 
//   } catch (error) {
//     console.error('Error fetching data:', error);
//   }
// }

// fetchData();

