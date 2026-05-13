const sharp = require('sharp');

/**
 * Converts any uploaded image (WebP, PNG, HEIC, etc.) to JPEG.
 * Returns a new file-like object with corrected buffer, mimetype, and size.
 * JPEG is the safest format for Perfect Corp's AI engine.
 */
async function normalizeToJpeg(file) {
  if (!file.buffer || file.buffer.length === 0) {
    const err = new Error('Uploaded file is empty. Please capture or select a valid image.');
    err.status = 400;
    throw err;
  }

  console.log('[normalizeImage] input buffer:', file.buffer.length, 'bytes, mimetype:', file.mimetype);

  try {
    const jpeg = await sharp(file.buffer)
      .rotate()
      .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 88 })
      .toBuffer();

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
