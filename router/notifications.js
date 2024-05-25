const { Router } = require("express");

const router = Router();

const { readNote,
    insertNote,
    updateNotes,
    insertFundsNote,
    readAdminnotes } = require('../database/notifications')

const { authenticateToken } = require("../middleware/token");
router.use(authenticateToken);

router.get('/admin/', async (req, res) => {
    try {
        // console.log("get all admin notes");
        const userData = await readAdminnotes();
        res.status(200).json(userData);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});


router.get('/:id', async (req, res) => {
    try {
        console.log("hi")
        const id = req.params.id;
        console.log("why1",id);
        const userData = await readNote(id);
        res.status(200).json(userData);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});



router.post('/', async (req, res) => {
    try {

        console.log(req.body);
        const userData = await insertNote(req.body);
        res.status(200).json(userData);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

router.post('/funds', async (req, res) => {
    try {

        console.log(req.body);
        const userData = await insertFundsNote(req.body);
        res.status(200).json(userData);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});


router.put('/', async (req, res) => {
    try {
        // console.log(req.body);
        const userData = await updateNotes(req.body);

        res.status(200).json(userData);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;