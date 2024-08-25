const express = require("express");
const router = express.Router();
const { getPhoto, getGallery } = require("../controllers/photos-controller");

// Route to retrieve an image by filename
router.get("/gallery/:filename", getPhoto);

router.get("/gallery", getGallery);

module.exports = router;
