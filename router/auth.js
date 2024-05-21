const { Router } = require("express");
const { readerUserData, insertUserData, updateUserPfp, blockUser, readAllUsers } = require('../database/Users/index')
const { insertFundingOpp,readFundOpps, readFundOppsForFM, updateFundingOpp } = require('../database/fundingOpps')

const multer = require('multer');

const { insertFundingApp, readFundApps, updateFundingApp } = require('../database/fundApps')
const { insertNotification, readNotifications, evaluateNotification } = require('../database/notifications')


const { insertApplicationsForFundingOpps, readapplicationsForFundingOpps, updateApplicationsForFundingOpps, UploadToBlobStorage  } = require('../database/applicationsForFundingOpps')

const router = Router();

router.post('/getUserData/:id', async (req, res) => {
    try {
        // console.log("moop");
        const id = req.params.id;
        const userData = await readerUserData(id);
        res.status(200).json(userData); 
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

router.post('/getApplicationsForFundingOpps/:id', async (req, res) => {
    try {
        // console.log("moop");
        const id = req.params.id;
        const userData = await readapplicationsForFundingOpps(id);
        res.status(200).json(userData); 
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

router.post('/insertApplicationsForFundingOpps/', async (req, res) => {
    try {
        // console.log("moop");
        const userData = await insertApplicationsForFundingOpps(req.body);
        res.status(200).json(userData); 
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

router.put('/updateFundingOpp/', async (req, res) => {
    try {
        // console.log(req.body);
        const userData = await updateFundingOpp(req.body);

        res.status(200).json(userData); 
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

router.put('/acceptOrDenyApplicant/', async (req, res) => {
    try {
        console.log(req.body);
        const userData = await updateApplicationsForFundingOpps(req.body);

        res.status(200).json(userData); 
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

router.post('/readFundOpps/:id', async (req, res) => {
    try {
        const userData = await readFundOpps(req.params.id);
        res.status(200).json(userData); 
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

router.post('/readFundOppsForFM/:id', async (req, res) => {
    try {
        const userData = await readFundOppsForFM(req.params.id);
        res.status(200).json(userData); 
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

router.put('/updateFundingApp/', async (req, res) => {
    try {
        console.log(req.body);
        const userData = await updateFundingApp(req.body);

        res.status(200).json(userData); 
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});


// only used by an admin to read all funding applications
router.post('/readFundApps/', async (req, res) => {
    try {
        const userData = await readFundApps();
        res.status(200).json(userData); 
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

router.post('/insertUserData/', async (req, res) => {
    try {
        // console.log("moop");
        const { email, profile_pic_url } = req.body;
        const userData = await insertUserData(email, profile_pic_url);
        res.status(200).json(userData); 
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

router.post('/insertFundingOpp/', async (req, res) => {
    try {

        const userData = await insertFundingOpp(req.body);
        res.status(200).json(userData); 
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

router.post('/insertFundingApp/', async (req, res) => {
    try {

        const userData = await insertFundingApp(req.body);
        res.status(200).json(userData); 
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

router.post('/readAllUsers/', async (req, res) => {
    try {
        const userData = await readAllUsers();
        res.status(200).json(userData); 
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

router.put('/updateUserProfilePic/', async (req, res) => {
    try {
        // console.log("moop");
        const { email, profile_pic_url } = req.body;
        const userData = await updateUserPfp(email, profile_pic_url);
        res.status(200).json(userData); 
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

router.put('/blockUser/', async (req, res) => {
    try {
        // console.log("moop");
        const { email } = req.body;
        const userData = await blockUser(email);
        res.status(200).json(userData); 
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});


router.post('/insertNotification/', async (req, res) => {
    try {
        // console.log("moop");
        const userData = await insertNotification(req.body);
        res.status(200).json(userData); 
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/')  // Ensure this directory exists
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now() + '-' + file.originalname)
    }
  });
  
  const upload = multer({ dest: 'uploads/' });

  router.post('/upload', upload.single('file'), async (req, res) => {
    try {
      
        const file = req.file;
        console.log(file);
        const userData = await UploadToBlobStorage(file);
        console.log(userData);
      res.send({"message": 'File uploaded successfully', "url" : userData} );
    } catch (error) {
      console.error('Error:', error);
      res.status(500).send('Failed to upload the file.');
    }
  });

router.put('/evaluateNotification/:id', async (req, res) => {
    try {
        // console.log(req.body);
        const userData = await evaluateNotification(req.params.id);

        res.status(200).json(userData); 
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

router.post('/readNotifications/:id', async (req, res) => {
    try {
        // console.log("moop");
        const id = req.params.id;
        const userData = await readNotifications(id);
        res.status(200).json(userData); 
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;