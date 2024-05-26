const { Router } = require("express");
const { updateUserPfp, blockUser, readAllUsers } = require('../database/Users/index')
const router = Router();

const { authenticateToken } = require("../middleware/token");
router.use(authenticateToken);


router.get('/All/', async (req, res) => {
    try {
        const userData = await readAllUsers();
        res.status(200).json(userData); 
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

router.put('/profile/', async (req, res) => {
    try {
        // console.log("moop");
        const userData = await updateUserPfp(req.body);
        res.status(200).json(userData); 
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

router.put('/', async (req, res) => {
    try {
        // console.log("moop");
        console.log(req.body);
        const userData = await blockUser(req.body);
        res.status(200).json(userData); 
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});





module.exports = router;