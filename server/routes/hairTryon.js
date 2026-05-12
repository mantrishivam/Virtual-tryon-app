const express = require('express');
const multer = require('multer');
const { applyHairTryon } = require('../controllers/hairTryonController');

const router = express.Router();

// Store file in memory as Buffer so we can forward it to Perfect Corp API
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  },
});

router.post('/', upload.single('image'), applyHairTryon);

module.exports = router;
