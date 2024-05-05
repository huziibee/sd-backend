const { Router } = require("express");
const { readerUserData, insertUserData, updateUserData } = require('../database/Users/index')
const { insertFundingOpp,readFundOpps } = require('../database/fundingOpps')

const { insertFundingApp, readFundApps, updateFundingApp } = require('../database/fundApps')

const { insertApplicationsForFundingOpps, readapplicationsForFundingOpps, updateApplicationsForFundingOpps } = require('../database/applicationsForFundingOpps')

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

router.post('/readFundOpps/', async (req, res) => {
    try {
        const userData = await readFundOpps();
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

router.put('/updateUserProfilePic/', async (req, res) => {
    try {
        // console.log("moop");
        const { email, profile_pic_url } = req.body;
        const userData = await updateUserData(email, profile_pic_url);
        res.status(200).json(userData); 
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});




module.exports = router;