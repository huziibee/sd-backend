const { Router } = require("express");

const router = Router();

const { insertApplicationsForFundingOpps, readapplicationsForFundingOpps, updateApplicationsForFundingOpps } = require('../database/applicationsForFundingOpps');
const { authenticateToken } = require("../middleware/token");
router.use(authenticateToken);

router.get('/:id', async (req, res) => {
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

router.post('/', async (req, res) => {
    try {
        // console.log("moop");
        const userData = await insertApplicationsForFundingOpps(req.body);
        res.status(200).json(userData); 
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

router.put('/', async (req, res) => {
    try {
        console.log(req.body);
        const userData = await updateApplicationsForFundingOpps(req.body);

        res.status(200).json(userData); 
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});




module.exports = router;