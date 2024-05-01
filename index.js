// imports
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const history = require('connect-history-api-fallback');
const authRoute = require('./router/auth');

const app = express();
const portt = process.env.PORT || 3019;

// Serve static files from the 'public' folder
app.use(express.static(path.resolve(__dirname, './dist'), { maxAge : '1y', etag: false}));
app.use(history());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use('/api/v1/auth', authRoute);

// Handle requests that don't match any routes by serving the frontend index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, './dist/index.html'));
});

app.listen( portt, () => {
  console.log(`Example app listening on port ${ portt}`);
});


const baseurl = process.env.PORT ? "https://ezezimalii.azurewebsites.net/" : 'http://localhost:'+portt;

fetch(baseurl+'/api/v1/auth/insertFundingApp/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    "title": "1dsEducasstion Enrichment Scholarship",
    "summary": "Supporting academic excellence and educational opportunities for underprivileged students.",
    "description": "This scholarship program aims to provide financial assistance to deserving students for pursuing higher education, vocational training, and skill development programs."
  }) 
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));