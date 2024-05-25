const { Router } = require("express");

const router = Router();

const { insertFundingOpp,readFundOpps, readFundOppsForFM, updateFundingOpp } = require('../database/fundingOpps')

const { authenticateToken } = require("../middleware/token");
router.use(authenticateToken);




router.get('/fund-manager/:id', async (req, res) => {
    try {
        console.log(req.params.id);
        const userData = await readFundOppsForFM(req.params.id);
        res.status(200).json(userData); 
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

router.get('/:id', async (req, res) => {
    try {
        const userData = await readFundOpps(req.params.id);
        res.status(200).json(userData); 
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

router.post('/', async (req, res) => {
    try {

        const userData = await insertFundingOpp(req.body);
        res.status(200).json(userData); 
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});
router.put('/', async (req, res) => {
    try {
        // console.log(req.body);
        const userData = await updateFundingOpp(req.body);

        res.status(200).json(userData); 
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;