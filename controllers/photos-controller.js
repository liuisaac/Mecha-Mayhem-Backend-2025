// Load environment variables from .env file
require('dotenv').config();

// Import the S3 client from AWS SDK v3
const { S3Client, GetObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');
const { Readable } = require('stream');
const sharp = require('sharp');
const heicConvert = require('heic-convert'); // Correct import


// Configure the AWS SDK
const s3 = new S3Client({
    region: "us-east-2",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});



const getPhoto = async (req, res) => {
    const filename = req.params.filename;
    console.log("Fetching image for filename:", filename);

    try {
        // Create the parameters for the S3 command
        const params = {
            Bucket: 'mecha-photo-gallery', // Replace with your bucket name
            Key: filename, // Path to the file in S3
        };

        // Create a command to get the object
        const command = new GetObjectCommand(params);

        // Fetch the object from S3
        const data = await s3.send(command);

        // Check if data.Body is available
        if (!data.Body) {
            console.error("No data received from S3.");
            return res.status(404).json({ error: "Image not found" });
        }

        // Create a readable stream from the S3 object
        const stream = data.Body;

        // Check if the file is HEIC
        if (filename.toLowerCase().endsWith('.heic')) {
            const buffer = await streamToBuffer(stream); // Convert stream to buffer
            const outputBuffer = await heicConvert({
                buffer: buffer, // the HEIC file buffer
                format: 'JPEG', // output format
                quality: 0.8, // quality from 0 to 1
            });

            // Set appropriate content type
            res.setHeader("Content-Type", "image/jpeg");
            return res.send(outputBuffer);
        } else {
            // Use Sharp to process the image (HEIC or any other format)
            const transformer = sharp()
                .resize(1000) // Resize to a max width of 1000 pixels
                .jpeg({ quality: 80 }); // Compress to 80% quality

            // Set appropriate content type
            res.setHeader("Content-Type", data.ContentType || "image/jpeg");

            // Pipe the transformed image to the response
            Readable.from(stream).pipe(transformer).pipe(res);
        }
    } catch (error) {
        if (error.name === 'NoSuchKey') {
            console.error("Image not found:", error);
            return res.status(404).json({ error: "Image not found" });
        } else {
            console.error("Error fetching image:", error);
            return res.status(500).json({ error: "Failed to fetch image" });
        }
    }
};

const getGallery = async (req, res) => {
    try {
        // Create the parameters for the S3 command
        const params = {
            Bucket: 'mecha-photo-gallery', // Replace with your bucket name
            Prefix: ``, // Path to the folder in S3
        };

        // Create a command to list objects
        const command = new ListObjectsV2Command(params);

        // Fetch the objects from S3
        const data = await s3.send(command);

        // Check if data.Contents is available
        if (!data.Contents) {
            console.error("No files found in the S3 bucket.");
            return res.status(404).json({ error: "No images found" });
        }

        // Generate URLs for each file
        const urls = data.Contents.map((file) => {
            return {
                url: `${file.Key}`, // Construct the URL for the file
                // Optionally, you can include other metadata here
            };
        });

        res.json(urls);
    } catch (error) {
        console.error("Error fetching images:", error);
        res.status(500).json({ error: "Failed to fetch images" });
    }
};

// Helper function to convert stream to buffer
const streamToBuffer = (stream) => {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on('data', chunk => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', reject);
    });
};

module.exports = { getPhoto, getGallery };
