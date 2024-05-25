const { Router } = require("express");
const { readerUserData } = require('../database/Users/index')
const router = Router();

router.get('/', async (req, res) => {
    try {

        const userData = await readerUserData(req.query);
        res.status(200).json(userData); 
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;