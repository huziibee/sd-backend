const { Router } = require("express");

const router = Router();


// router.use(authenticateToken);

router.post('/', async (req, res) => {
    try {
        // const bloburl = await UploadToBlobStorage(req.body);
        res.status(200).json(bloburl); 
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});


module.exports = router;