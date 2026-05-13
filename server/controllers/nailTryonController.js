const axios = require('axios');
const { normalizeToJpeg } = require('../utils/normalizeImage');

const BASE_URL = process.env.PERFECT_API_BASE_URL || 'https://yce-api-01.makeupar.com';
const API_KEY  = process.env.PERFECT_API_KEY;

function authHeaders(extra = {}) {
  return { Authorization: `Bearer ${API_KEY}`, ...extra };
}

const ALL_FINGERS = ['thumb', 'index', 'middle', 'ring', 'pinky'];

// Press-on nails only support these three textures
const PRESS_ON_TEXTURES = ['matte', 'cream', 'metallic'];

function buildEffects(effectType, { nailColor, texture, contrast, reflection, roughness, transparency, nailShape, nailLength }) {
  return ALL_FINGERS.map(finger => {
    if (effectType === 'press_on_nails') {
      const safeTexture = PRESS_ON_TEXTURES.includes(texture) ? texture : 'cream';
      return {
        sub_type:   'color',
        finger,
        shape:      nailShape || 'squoval_oval',
        length:     parseFloat(nailLength) || 1.0,
        color:      nailColor,
        texture:    safeTexture,
        reflection: parseInt(reflection, 10),
        contrast:   parseInt(contrast, 10),
        roughness:  parseInt(roughness, 10),
      };
    }
    // nail_polish
    return {
      sub_type:     'color',
      finger,
      color:        nailColor,
      texture,
      reflection:   parseInt(reflection, 10),
      contrast:     parseInt(contrast, 10),
      roughness:    parseInt(roughness, 10),
      transparency: parseInt(transparency, 10),
    };
  });
}

async function applyNailTryon(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Image file is required' });
    }
    if (!API_KEY) {
      return res.status(500).json({ success: false, error: 'PERFECT_API_KEY not set in .env' });
    }

    const {
      nailColor    = '#FF0000',
      texture      = 'cream',
      effectType   = 'nail_polish',
      contrast     = 50,
      reflection   = 50,
      roughness    = 50,
      transparency = 0,
      nailShape    = 'squoval_oval',
      nailLength   = 1.0,
    } = req.body;

    // Normalize + auto-resize to stay within Perfect Corp's 2048px long-side limit
    const file = await normalizeToJpeg(req.file);

    // ── Step 1: Get pre-signed S3 upload URL ────────────────────────────────
    const uploadMetaRes = await axios.post(
      `${BASE_URL}/s2s/v2.0/file/nail-vto`,
      { files: [{ content_type: file.mimetype, file_name: file.originalname, file_size: file.size }] },
      { headers: authHeaders({ 'Content-Type': 'application/json' }), timeout: 15000 }
    );

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

    // ── Step 2: PUT image to S3 ──────────────────────────────────────────────
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

    if (s3Res.status !== 200) {
      return res.status(502).json({
        success: false,
        error: `Image upload to S3 failed (HTTP ${s3Res.status}). Check image format/size.`,
      });
    }

    // ── Step 3: Submit nail task (retry up to 3x on 5xx) ────────────────────
    const effects = buildEffects(effectType, {
      nailColor, texture, contrast, reflection, roughness, transparency, nailShape, nailLength,
    });

    let taskId;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const taskRes = await axios.post(
          `${BASE_URL}/s2s/v2.0/task/nail-vto`,
          { src_file_id: fileId, effect_type: effectType, version: '1.0', effects },
          { headers: authHeaders({ 'Content-Type': 'application/json' }), timeout: 15000 }
        );
        taskId = taskRes.data?.data?.task_id;
        if (taskId) break;
      } catch (stepErr) {
        const status = stepErr.response?.status;
        console.warn(`[nail] task attempt ${attempt} failed (${status}):`, stepErr.response?.data);
        if (attempt === 3 || (status && status < 500)) throw stepErr;
        await sleep(1500);
      }
    }

    if (!taskId) {
      return res.status(502).json({ success: false, error: 'Task submission failed — no task_id' });
    }

    // ── Step 4: Poll ─────────────────────────────────────────────────────────
    const resultUrl = await pollTask('nail-vto', taskId);
    return res.json({ success: true, resultImageUrl: resultUrl });

  } catch (err) {
    if (err.response) {
      console.error('[nail] upstream error:', JSON.stringify(err.response.data));
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

    const { task_status, results, error } = res.data?.data || {};

    if (task_status === 'success') return results?.url || null;
    if (task_status === 'error') {
      const msg = error === 'unknown_internal_error'
        ? 'The AI could not process this image. Use a clear back-of-hand photo with all fingers visible and spread apart.'
        : `Task failed: ${error}`;
      const e = new Error(msg);
      e.status = 422;
      throw e;
    }
  }
  const e = new Error('Timed out waiting for Perfect Corp nail result');
  e.status = 504;
  throw e;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

module.exports = { applyNailTryon };
