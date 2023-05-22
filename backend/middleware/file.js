const multer = require('multer');

const MIME_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg'
};

const storage = multer.diskStorage({
    destination: (req, res, cb) => {
        const isValid = true;
        let error = new Error('Invalid mime type');
        if(isValid){
            error = null;
        }
        cb(null, 'backend/images');
    },
    filename: (req, file, cb) => {
        const name = file.originalname.toLowerCase().split(' ').join('-');
        const extension = MIME_TYPE_MAP[file.mimetype];
        cb(null, name + '-' + Date.now() + '-' + extension);
    }
});

module.exports = multer({storage: storage}).single('image');