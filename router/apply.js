const { Router } = require("express");
const { insertFundingApp, readFundApps, updateFundingApp } = require('../database/fundApps')
const router = Router();

const { authenticateToken } = require("../middleware/token");
router.use(authenticateToken);

router.post('/', async (req, res) => {
    try {

        const userData = await insertFundingApp(req.body);
        res.status(200).json(userData); 
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});


// only used by an admin to read all funding applications
router.get('/', async (req, res) => {
    try {
        console.log("get all funding applications");
        const userData = await readFundApps();
        res.status(200).json(userData); 
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

router.put('/', async (req, res) => {
    try {
        console.log(req.body);
        const userData = await updateFundingApp(req.body);

        res.status(200).json(userData); 
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});



module.exports = router;