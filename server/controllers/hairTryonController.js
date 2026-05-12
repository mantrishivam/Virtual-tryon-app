const axios = require('axios');
const { normalizeToJpeg } = require('../utils/normalizeImage');

const BASE_URL = process.env.PERFECT_API_BASE_URL || 'https://yce-api-01.makeupar.com';
const API_KEY  = process.env.PERFECT_API_KEY;

function authHeaders(extra = {}) {
  return { Authorization: `Bearer ${API_KEY}`, ...extra };
}

/**
 * POST /api/hair-tryon
 *
 * Real Perfect Corp YCE v2 flow:
 *   1. POST /s2s/v2.0/file/hair-color  (JSON, not multipart)
 *      → returns file_id + pre-signed S3 PUT url
 *   2. PUT <s3_url> with the raw image bytes
 *   3. POST /s2s/v2.0/task/hair-color  { src_file_id, pattern, palettes }
 *      → returns task_id
 *   4. Poll GET /s2s/v2.0/task/hair-color/{task_id}
 *      → data.task_status === 'success', data.results.url = result image
 *
 * Request body:
 *   pattern.name : "full" | "ombre"
 *   palettes[0].color : "#RRGGBB"
 */
async function applyHairTryon(req, res, next) {
  try {
    console.log('[hair-tryon] req.file:', req.file
      ? { fieldname: req.file.fieldname, originalname: req.file.originalname, mimetype: req.file.mimetype, size: req.file.size, bufferLength: req.file.buffer?.length }
      : 'MISSING');

    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Image file is required' });
    }
    if (!API_KEY) {
      return res.status(500).json({ success: false, error: 'PERFECT_API_KEY not set in .env' });
    }

    const { hairColor = '#8B4513', patternName = 'full' } = req.body;

    console.log('[hair-tryon] normalizing image...');
    const file = await normalizeToJpeg(req.file);
    console.log('[hair-tryon] normalized:', { size: file.size, mimetype: file.mimetype });

    // ── Step 1: Request a pre-signed S3 upload URL ───────────────────────────
    console.log('[hair-tryon] step 1: requesting S3 upload URL');
    const uploadMetaRes = await axios.post(
      `${BASE_URL}/s2s/v2.0/file/hair-color`,
      {
        files: [{
          content_type: file.mimetype,
          file_name:    file.originalname,
          file_size:    file.size,
        }],
      },
      { headers: authHeaders({ 'Content-Type': 'application/json' }), timeout: 15000 }
    );
    console.log('[hair-tryon] step 1 response:', JSON.stringify(uploadMetaRes.data));

    const fileEntry = uploadMetaRes.data?.data?.files?.[0];
    const fileId    = fileEntry?.file_id;
    const s3Request = fileEntry?.requests?.[0];

    if (!fileId || !s3Request?.url) {
      return res.status(502).json({
        success: false,
        error: 'Failed to get upload URL from Perfect Corp',
        raw: uploadMetaRes.data,
      });
    }

    // ── Step 2: PUT the image directly to S3 ────────────────────────────────
    console.log('[hair-tryon] step 2: uploading to S3, file_id:', fileId);
    const s3Res = await axios.put(s3Request.url, file.buffer, {
      headers: {
        'Content-Type':   file.mimetype,
        'Content-Length': String(file.size),
        ...(s3Request.headers || {}),
      },
      timeout: 30000,
      maxBodyLength: Infinity,
      validateStatus: () => true,
    });
    console.log('[hair-tryon] step 2 S3 response status:', s3Res.status);

    if (s3Res.status !== 200) {
      console.error('S3 upload failed:', s3Res.status, s3Res.data);
      return res.status(502).json({
        success: false,
        error: `Image upload to S3 failed (HTTP ${s3Res.status}). Check image format/size.`,
      });
    }

    // ── Step 3: Submit the hair-color task (retry up to 3x on 5xx) ─────────
    console.log('[hair-tryon] step 3: submitting task');
    let taskId;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const taskRes = await axios.post(
          `${BASE_URL}/s2s/v2.0/task/hair-color`,
          { src_file_id: fileId, pattern: { name: patternName }, palettes: [{ color: hairColor }] },
          { headers: authHeaders({ 'Content-Type': 'application/json' }), timeout: 15000 }
        );
        console.log(`[hair-tryon] step 3 attempt ${attempt}:`, JSON.stringify(taskRes.data));
        taskId = taskRes.data?.data?.task_id;
        if (taskId) break;
      } catch (stepErr) {
        const status = stepErr.response?.status;
        console.warn(`[hair-tryon] step 3 attempt ${attempt} failed (HTTP ${status}):`, stepErr.response?.data);
        if (attempt === 3 || (status && status < 500)) throw stepErr;
        await sleep(1500);
      }
    }

    if (!taskId) {
      return res.status(502).json({ success: false, error: 'Task submission failed — no task_id' });
    }

    console.log('[hair-tryon] step 4: polling task_id:', taskId);
    const resultUrl = await pollTask('hair-color', taskId);
    return res.json({ success: true, resultImageUrl: resultUrl });
  } catch (err) {
    console.error('[hair-tryon] caught error:', err.message, '| status:', err.status);
    if (err.response) {
      console.error('[hair-tryon] upstream response body:', JSON.stringify(err.response.data));
      return res.status(err.response.status).json({
        success: false,
        error: err.response.data?.error || err.response.data?.message || 'Perfect Corp API error',
        details: err.response.data,
      });
    }
    if (err.status) {
      return res.status(err.status).json({ success: false, error: err.message });
    }
    next(err);
  }
}

async function pollTask(feature, taskId, maxAttempts = 30, intervalMs = 2000) {
  for (let i = 0; i < maxAttempts; i++) {
    await sleep(intervalMs);

    const res = await axios.get(
      `${BASE_URL}/s2s/v2.0/task/${feature}/${taskId}`,
      { headers: authHeaders(), timeout: 10000 }
    );
    console.log(`[hair-tryon] poll ${i + 1}:`, res.data?.data?.task_status);

    const { task_status, results, error } = res.data?.data || {};

    if (task_status === 'success') {
      return results?.url || null;
    }
    if (task_status === 'error') {
      const msg = error === 'unknown_internal_error'
        ? 'The AI could not process this image. Use a clear portrait photo with visible hair (JPEG/PNG, min 200×200px).'
        : `Task failed: ${error}`;
      const e = new Error(msg);
      e.status = 422;
      throw e;
    }
  }
  const e = new Error('Timed out waiting for Perfect Corp result');
  e.status = 504;
  throw e;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

module.exports = { applyHairTryon };
