const sharp = require('sharp');

/**
 * Converts any uploaded image (WebP, PNG, HEIC, etc.) to JPEG.
 * Returns a new file-like object with corrected buffer, mimetype, and size.
 * JPEG is the safest format for Perfect Corp's AI engine.
 *
 * @param {object} file - multer file object with .buffer and .mimetype
 * @param {object} [opts]
 * @param {number} [opts.maxDimension=2000] - max long-side in pixels
 * @param {number} [opts.quality=88]        - JPEG quality (1-100)
 * @param {number|null} [opts.maxBytes]     - hard byte cap; triggers a second pass if exceeded
 */
async function normalizeToJpeg(file, { maxDimension = 2000, quality = 88, maxBytes = null } = {}) {
  if (!file.buffer || file.buffer.length === 0) {
    const err = new Error('Uploaded file is empty. Please capture or select a valid image.');
    err.status = 400;
    throw err;
  }

  console.log('[normalizeImage] input buffer:', file.buffer.length, 'bytes, mimetype:', file.mimetype);

  try {
    let jpeg = await sharp(file.buffer)
      .rotate()
      .resize(maxDimension, maxDimension, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality })
      .toBuffer();

    if (maxBytes && jpeg.length > maxBytes) {
      const reducedQuality = Math.max(60, Math.round(quality * 0.8));
      console.log(`[normalizeImage] output (${jpeg.length} bytes) > maxBytes (${maxBytes}), retrying at quality ${reducedQuality}`);
      jpeg = await sharp(jpeg).jpeg({ quality: reducedQuality }).toBuffer();
      console.log(`[normalizeImage] after re-compress: ${jpeg.length} bytes`);
    }

    console.log('[normalizeImage] output JPEG:', jpeg.length, 'bytes');
    return {
      buffer:       jpeg,
      mimetype:     'image/jpeg',
      originalname: file.originalname.replace(/\.[^.]+$/, '.jpg'),
      size:         jpeg.length,
    };
  } catch (sharpErr) {
    console.error('[normalizeImage] sharp error:', sharpErr.message);
    const err = new Error('Image processing failed: ' + sharpErr.message);
    err.status = 400;
    throw err;
  }
}

module.exports = { normalizeToJpeg };
