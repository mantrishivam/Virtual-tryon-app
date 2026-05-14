const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const MIN_DIM = 200;
const BRIGHTNESS_MIN = 15; // avg channel 0-255 — relaxed for indoor/dim shots

export async function validateImage(file) {
  if (!ALLOWED_TYPES.has(file.type)) {
    return { ok: false, reason: 'Unsupported format. Please use JPG, PNG, or WEBP.' };
  }

  if (file.size > MAX_BYTES) {
    return { ok: false, reason: `Image is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max 10 MB.` };
  }

  let bitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return { ok: false, reason: 'Could not read image. File may be corrupted.' };
  }

  const { width, height } = bitmap;
  if (width < MIN_DIM || height < MIN_DIM) {
    bitmap.close();
    return { ok: false, reason: `Image too small (${width}×${height}px). Minimum ${MIN_DIM}×${MIN_DIM}px.` };
  }

  // Sample a 100×100 region from the centre for quality checks.
  // Wrapped in try/catch — OffscreenCanvas may not be available in all environments;
  // if the quality check fails we pass the image through rather than blocking uploads.
  try {
    const sampleSize = 100;
    const canvas = new OffscreenCanvas(sampleSize, sampleSize);
    const ctx = canvas.getContext('2d');
    const sx = Math.max(0, (width - sampleSize) / 2);
    const sy = Math.max(0, (height - sampleSize) / 2);
    ctx.drawImage(bitmap, sx, sy, sampleSize, sampleSize, 0, 0, sampleSize, sampleSize);
    bitmap.close();

    const { data } = ctx.getImageData(0, 0, sampleSize, sampleSize);
    const pixelCount = sampleSize * sampleSize;

    let brightnessSum = 0;
    for (let i = 0; i < pixelCount; i++) {
      const r = data[i * 4];
      const g = data[i * 4 + 1];
      const b = data[i * 4 + 2];
      brightnessSum += 0.299 * r + 0.587 * g + 0.114 * b;
    }

    const avgBrightness = brightnessSum / pixelCount;
    if (avgBrightness < BRIGHTNESS_MIN) {
      return { ok: false, reason: 'Image is too dark. Please use better lighting and try again.' };
    }
  } catch {
    bitmap.close?.();
  }

  return { ok: true };
}
