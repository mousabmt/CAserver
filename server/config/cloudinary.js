const cloudinary = require('cloudinary').v2;
cloudinary.config({
    secret:true,
    url:process.env.CLOUDINARY_URL
})
module.exports = cloudinary;