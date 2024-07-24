const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const sharp = require("sharp");
const heicConvert = require("heic-convert");

const bucket = admin.storage().bucket();

// Route to retrieve an image by filename
router.get("/gallery/:filename", async (req, res) => {
    const filename = req.params.filename;

    try {
        // Reference to the file in Firebase Storage
        const file = bucket.file(`gallery/${filename}`);

        const [fileExists] = await file.exists();

        if (!fileExists) {
            console.error(`Image ${filename} not found in Firebase Storage.`);
            return res.status(404).json({ error: "Image not found" });
        }

        // Create a readable stream from Firebase Storage
        const stream = file.createReadStream();

        // Use Sharp to resize and compress the image
        let transformer = sharp()
            .resize(1000) // Resize to a max width of 400 pixels
            .jpeg({ quality: 80 }); // Compress to 70% quality

        // Dynamically determined content type based on file extension
        let contentType = "image/jpeg";

        // Set appropriate content type
        res.setHeader("Content-Type", contentType);

        // Pipe the transformed image to the response
        stream.pipe(transformer).pipe(res);
    } catch (error) {
        console.error("Error fetching image:", error);
        res.status(500).json({ error: "Failed to fetch image" });
    }
});

router.get("/gallery", async (req, res) => {
    const folderName = "gallery"; // Replace with your folder name in Firebase Storage

    try {
        const [files] = await bucket.getFiles({
            prefix: `${folderName}/`,
        });

        files.shift();

        const urls = files.map((file) => {
            return {
                url: `http://localhost:8080/photos/${file.name}`,
                // Optionally, you can include other metadata here
            };
        });

        res.json(urls);
    } catch (error) {
        console.error("Error fetching images:", error);
        res.status(500).json({ error: "Failed to fetch images" });
    }
});

module.exports = router;
