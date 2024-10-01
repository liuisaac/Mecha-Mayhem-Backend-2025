require('dotenv').config();  // Load .env file into process.env

// Import the AWS SDK
const AWS = require('aws-sdk');

// Configure AWS with access keys and region from environment variables
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,     // Load from .env
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, // Load from .env
  region: "us-east-2"              // Load from .env
});

// Create an S3 instance
const s3 = new AWS.S3();
