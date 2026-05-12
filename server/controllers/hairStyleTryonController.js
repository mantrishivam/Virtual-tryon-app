const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { normalizeToJpeg } = require("../utils/normalizeImage");

const BASE_URL = process.env.PERFECT_API_BASE_URL || "https://yce-api-01.makeupar.com";
const API_KEY  = process.env.PERFECT_API_KEY;

const HAIRSTYLE_DIR = path.join(__dirname, "../../client/public/hairstyles");

function auth(extra = {}) {
  return { Authorization: `Bearer ${API_KEY}`, ...extra };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function uploadToS3(buffer, filename, mimetype) {
  const metaRes = await axios.post(
    `${BASE_URL}/s2s/v2.1/file/hair-transfer`,
    { files: [{ content_type: mimetype, file_name: filename, file_size: buffer.length }] },
    { headers: auth({ "Content-Type": "application/json" }), timeout: 15000 },
  );

  const entry = metaRes.data?.data?.files?.[0];
  const fileId = entry?.file_id;
  const s3Req  = entry?.requests?.[0];

  if (!fileId || !s3Req?.url) {
    throw Object.assign(new Error("Failed to get upload URL from Perfect Corp"), { status: 502 });
  }

  const s3Res = await axios.put(s3Req.url, buffer, {
    headers: {
      "Content-Type":   mimetype,
      "Content-Length": String(buffer.length),
      ...(s3Req.headers || {}),
    },
    timeout: 30000,
    maxBodyLength: Infinity,
    validateStatus: () => true,
  });

  if (s3Res.status !== 200) {
    throw Object.assign(new Error(`S3 upload failed (HTTP ${s3Res.status})`), { status: 502 });
  }

  return fileId;
}

/**
 * POST /api/hair-style-tryon
 * Body: image (multipart), styleIndex (1–10)
 *
 * Flow:
 *   1. Upload user portrait → src_file_id
 *   2. Upload local hairstyle reference image → dst_file_id  (both in parallel)
 *   3. POST /s2s/v2.1/task/hair-transfer  { src_file_id, dst_file_id }
 *   4. Poll until success
 */
async function applyHairStyleTryon(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "Image file is required" });
    }
    if (!API_KEY) {
      return res.status(500).json({ success: false, error: "PERFECT_API_KEY not set in .env" });
    }

    const styleIndex = parseInt(req.body.styleIndex, 10);
    if (!styleIndex || styleIndex < 1 || styleIndex > 10) {
      return res.status(400).json({ success: false, error: "styleIndex (1–10) is required" });
    }

    const refImagePath = path.join(HAIRSTYLE_DIR, `${styleIndex}.jpg`);
    if (!fs.existsSync(refImagePath)) {
      return res.status(400).json({ success: false, error: `Hairstyle image ${styleIndex}.jpg not found` });
    }

    // Normalize user portrait to JPEG
    const portrait = await normalizeToJpeg(req.file);
    const refBuffer = fs.readFileSync(refImagePath);

    console.log(`[hairstyle] uploading portrait (${portrait.size}B) + ref image ${styleIndex}.jpg (${refBuffer.length}B)`);

    // ── Steps 1 & 2: Upload both images in parallel ───────────────────────────
    const [srcFileId, dstFileId] = await Promise.all([
      uploadToS3(portrait.buffer, portrait.originalname, portrait.mimetype),
      uploadToS3(refBuffer, `${styleIndex}.jpg`, "image/jpeg"),
    ]);

    console.log("[hairstyle] src_file_id:", srcFileId.slice(0, 20), "| dst_file_id:", dstFileId.slice(0, 20));

    // ── Step 3: Submit task (retry up to 3x on 5xx) ───────────────────────────
    let taskId;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const taskRes = await axios.post(
          `${BASE_URL}/s2s/v2.1/task/hair-transfer`,
          { src_file_id: srcFileId, ref_file_id: dstFileId },
          { headers: auth({ "Content-Type": "application/json" }), timeout: 15000 },
        );
        console.log(`[hairstyle] task attempt ${attempt}:`, JSON.stringify(taskRes.data));
        taskId = taskRes.data?.data?.task_id;
        if (taskId) break;
      } catch (stepErr) {
        const status = stepErr.response?.status;
        console.warn(`[hairstyle] task attempt ${attempt} failed (${status}):`, stepErr.response?.data);
        if (attempt === 3 || (status && status < 500)) throw stepErr;
        await sleep(1500);
      }
    }

    if (!taskId) {
      return res.status(502).json({ success: false, error: "No task_id returned" });
    }

    // ── Step 4: Poll ──────────────────────────────────────────────────────────
    for (let i = 0; i < 30; i++) {
      await sleep(2000);
      const poll = await axios.get(
        `${BASE_URL}/s2s/v2.1/task/hair-transfer/${taskId}`,
        { headers: auth(), timeout: 10000 },
      );
      const { task_status, results, error } = poll.data?.data || {};
      console.log(`[hairstyle] poll ${i + 1}:`, task_status);

      if (task_status === "success") {
        return res.json({ success: true, resultImageUrl: results?.url || null });
      }
      if (task_status === "error") {
        const msg = error === "unknown_internal_error"
          ? "The AI could not process this image. Use a clear frontal portrait photo."
          : `Task failed: ${error}`;
        return res.status(422).json({ success: false, error: msg });
      }
    }

    return res.status(504).json({ success: false, error: "Timed out waiting for result" });
  } catch (err) {
    console.error("[hairstyle] error:", err.message);
    if (err.response) {
      console.error("[hairstyle] upstream body:", JSON.stringify(err.response.data));
      return res.status(err.response.status).json({
        success: false,
        error: err.response.data?.error || err.response.data?.message || "Perfect Corp API error",
        details: err.response.data,
      });
    }
    if (err.status) {
      return res.status(err.status).json({ success: false, error: err.message });
    }
    next(err);
  }
}

module.exports = { applyHairStyleTryon };
