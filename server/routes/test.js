const express = require('express');
const axios   = require('axios');
const router  = express.Router();

const BASE_URL = process.env.PERFECT_API_BASE_URL || 'https://yce-api-01.makeupar.com';
const API_KEY  = process.env.PERFECT_API_KEY;

function auth(extra = {}) {
  return { Authorization: `Bearer ${API_KEY}`, ...extra };
}
const sleep = ms => new Promise(r => setTimeout(r, ms));

/**
 * GET /api/test/hair
 * Runs the full upload → task → poll pipeline using Perfect Corp's own
 * sample image (bypasses browser upload). If this succeeds, the pipeline
 * code is fine and the issue is the user's uploaded image content.
 */
router.get('/hair', async (req, res) => {
  try {
    // 1. Download Perfect Corp's sample hair image into a buffer
    const imgRes = await axios.get(
      'https://plugins-media.makeupar.com/strapi/assets/hair_color_01_45a45b4331.jpg',
      { responseType: 'arraybuffer', timeout: 15000 }
    );
    const buffer   = Buffer.from(imgRes.data);
    const mimeType = 'image/jpeg';
    const fileName = 'sample.jpg';
    const fileSize = buffer.length;
    console.log('[test] sample image downloaded, size:', fileSize);

    // 2. Request S3 upload URL
    const metaRes = await axios.post(
      `${BASE_URL}/s2s/v2.0/file/hair-color`,
      { files: [{ content_type: mimeType, file_name: fileName, file_size: fileSize }] },
      { headers: auth({ 'Content-Type': 'application/json' }), timeout: 15000 }
    );
    const entry = metaRes.data?.data?.files?.[0];
    const fileId = entry?.file_id;
    const s3Req  = entry?.requests?.[0];
    console.log('[test] file_id:', fileId ? '✓' : '✗', '| s3 url:', s3Req?.url ? '✓' : '✗');
    if (!fileId) return res.json({ step: 'get_upload_url', error: metaRes.data });

    // 3. PUT buffer to S3
    const s3Res = await axios.put(s3Req.url, buffer, {
      headers: { 'Content-Type': mimeType, 'Content-Length': String(fileSize), ...(s3Req.headers || {}) },
      timeout: 30000,
      maxBodyLength: Infinity,
      validateStatus: () => true,
    });
    console.log('[test] S3 PUT status:', s3Res.status);
    if (s3Res.status !== 200) return res.json({ step: 's3_upload', httpStatus: s3Res.status });

    // 4. Submit task
    const taskRes = await axios.post(
      `${BASE_URL}/s2s/v2.0/task/hair-color`,
      { src_file_id: fileId, pattern: { name: 'full' }, palettes: [{ color: '#cc3333' }] },
      { headers: auth({ 'Content-Type': 'application/json' }), timeout: 15000 }
    );
    const taskId = taskRes.data?.data?.task_id;
    console.log('[test] task_id:', taskId ? '✓' : '✗');
    if (!taskId) return res.json({ step: 'submit_task', error: taskRes.data });

    // 5. Poll
    for (let i = 1; i <= 20; i++) {
      await sleep(2000);
      const poll = await axios.get(
        `${BASE_URL}/s2s/v2.0/task/hair-color/${taskId}`,
        { headers: auth(), timeout: 10000 }
      );
      const { task_status, results, error } = poll.data?.data || {};
      console.log(`[test] poll ${i} → ${task_status}`);
      if (task_status === 'success') {
        return res.json({ success: true, resultImageUrl: results?.url });
      }
      if (task_status === 'error') {
        return res.json({ step: 'poll', task_status, error });
      }
    }
    return res.json({ step: 'poll', error: 'timeout' });
  } catch (err) {
    console.error('[test] error:', err.message);
    return res.status(500).json({ error: err.message, details: err.response?.data });
  }
});

module.exports = router;
