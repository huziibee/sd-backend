const { Router } = require("express");
const router = Router();

const { readReport } = require('../database/reports');
const { authenticateToken } = require("../middleware/token");
router.use(authenticateToken);


router.get('/:id', async (req, res) => { 
    try {
        const id = req.params.id;
        console.log(id)
        const userData = await readReport(id);
        res.status(200).json(userData); 
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;