const { Router } = require("express");
const { readerUserData, insertUserData, updateUserData } = require('../database/Users/index')
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

router.post('/updateUserProfilePic/', async (req, res) => {
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