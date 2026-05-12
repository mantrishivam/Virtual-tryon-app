const express = require('express');
const { listSkus } = require('../controllers/skusController');

const router = express.Router();

// GET /api/skus?type=hair_color  (or nail_color, hair_style — omit for all)
router.get('/', listSkus);

module.exports = router;
