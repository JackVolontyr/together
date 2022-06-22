const multer = require("multer");

const storage = multer.diskStorage({
	destination(_, __, cb) { cb(null, 'imgs'); },
	filename(_, file, cb) { cb(null, `${new Date().toISOString()}-${file.originalname}`); },
});

const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg'];

const fileFilter = (_, file, cb) => {
	allowedTypes.includes(file.mimetype) ? cb(null, true) : cb(null, false);
};

module.exports = multer({ storage, fileFilter });