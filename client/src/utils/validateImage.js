const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const MIN_DIM = 200;
const BRIGHTNESS_MIN = 30;   // avg channel 0-255
const BLUR_MIN_VARIANCE = 80; // Laplacian variance

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

  // Sample a 100×100 region from the centre for quality checks
  const sampleSize = 100;
  const canvas = new OffscreenCanvas(sampleSize, sampleSize);
  const ctx = canvas.getContext('2d');
  const sx = Math.max(0, (width - sampleSize) / 2);
  const sy = Math.max(0, (height - sampleSize) / 2);
  ctx.drawImage(bitmap, sx, sy, sampleSize, sampleSize, 0, 0, sampleSize, sampleSize);
  bitmap.close();

  const { data } = ctx.getImageData(0, 0, sampleSize, sampleSize);
  const pixelCount = sampleSize * sampleSize;

  // Build grayscale array + brightness check
  const gray = new Float32Array(pixelCount);
  let brightnessSum = 0;
  for (let i = 0; i < pixelCount; i++) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    const l = 0.299 * r + 0.587 * g + 0.114 * b;
    gray[i] = l;
    brightnessSum += l;
  }

  const avgBrightness = brightnessSum / pixelCount;
  if (avgBrightness < BRIGHTNESS_MIN) {
    return { ok: false, reason: 'Image is too dark. Please use better lighting and try again.' };
  }

  // Laplacian variance for blur detection (3×3 kernel)
  const W = sampleSize;
  let sum = 0;
  let sumSq = 0;
  let n = 0;
  for (let y = 1; y < W - 1; y++) {
    for (let x = 1; x < W - 1; x++) {
      const lap =
        -gray[(y - 1) * W + x] +
        -gray[y * W + (x - 1)] + 4 * gray[y * W + x] - gray[y * W + (x + 1)] +
        -gray[(y + 1) * W + x];
      sum += lap;
      sumSq += lap * lap;
      n++;
    }
  }
  const mean = sum / n;
  const variance = sumSq / n - mean * mean;

  if (variance < BLUR_MIN_VARIANCE) {
    return { ok: false, reason: 'Image appears blurry. Please hold the camera steady and try again.' };
  }

  return { ok: true };
}
