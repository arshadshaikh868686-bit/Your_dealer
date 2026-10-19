const cloudinary = require("cloudinary").v2; // cloudinary v2 import

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // .env se cloud name
  api_key: process.env.CLOUDINARY_API_KEY, // .env se key
  api_secret: process.env.CLOUDINARY_API_SECRET, // .env se secret
});

module.exports = cloudinary; // export