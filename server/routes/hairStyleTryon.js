const express = require('express');
const multer  = require('multer');
const { applyHairStyleTryon } = require('../controllers/hairStyleTryonController');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) return cb(new Error('Only image files are allowed'));
    cb(null, true);
  },
});

router.post('/', upload.single('image'), applyHairStyleTryon);

module.exports = router;
