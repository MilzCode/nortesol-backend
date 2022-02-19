var cloudinary = require('cloudinary').v2;

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_NAME,
	api_key: process.env.CLOUDINARY_KEY,
	api_secret: process.env.CLOUDINARY_SECRET,
});

const borrarImagenCloudinary = (urlImg) => {
	const nombreArr = urlImg.split('/');
	const nombreConExtension = nombreArr[nombreArr.length - 1];
	const nombreSinExtension = nombreConExtension.split('.')[0];
	cloudinary.uploader.destroy(nombreSinExtension);
};

module.exports = {
	borrarImagenCloudinary,
};
