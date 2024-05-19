const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.COLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET

})
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'Safar_DEV',
        allowerdFormats: ['png', 'jpg', 'jpeg']

    },
});

module.exports={
    storage,
    cloudinary
}