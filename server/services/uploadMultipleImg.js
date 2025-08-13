const cloudinary = require('../config/cloudinary');

async function uploadImg(filePath, folder = 'profile_pics') {
    const result = await cloudinary.uploader.upload(filePath, { folder });
    return result.secure_url;
}

module.exports = uploadImg ;