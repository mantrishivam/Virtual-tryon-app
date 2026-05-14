import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

function extractError(err) {
  return err.response?.data?.error || err.message || 'Request failed';
}

export async function applyHairTryon(imageFile, { hairColor, patternName }) {
  const formData = new FormData();
  formData.append('image', imageFile);
  formData.append('hairColor', hairColor);
  formData.append('patternName', patternName);

  try {
    const response = await axios.post(`${BASE_URL}/api/hair-tryon`, formData, {
      timeout: 120000,
    });
    if (!response.data.success) {
      throw new Error(response.data.error || 'Hair try-on failed');
    }
    return response.data;
  } catch (err) {
    throw new Error(extractError(err));
  }
}

export async function applyHairStyleTryon(imageFile, { styleIndex }) {
  const formData = new FormData();
  formData.append('image', imageFile);
  formData.append('styleIndex', styleIndex);

  try {
    const response = await axios.post(`${BASE_URL}/api/hair-style-tryon`, formData, {
      timeout: 120000,
    });
    if (!response.data.success) {
      throw new Error(response.data.error || 'Hair style try-on failed');
    }
    return response.data;
  } catch (err) {
    throw new Error(extractError(err));
  }
}

export async function applyNailTryon(imageFile, {
  nailColor, nailTexture, nailEffectType, nailShape, nailLength,
  transparency = 0, reflection = 50, contrast = 50, roughness = 0, fingers = 'all',
}) {
  const formData = new FormData();
  formData.append('image', imageFile);
  formData.append('nailColor', nailColor);
  formData.append('texture', nailTexture);
  formData.append('effectType', nailEffectType);
  formData.append('transparency', String(transparency));
  formData.append('reflection',   String(reflection));
  formData.append('contrast',     String(contrast));
  formData.append('roughness',    String(roughness));
  formData.append('fingers',      JSON.stringify(fingers));
  if (nailEffectType === 'press_on_nails') {
    formData.append('nailShape',  nailShape);
    formData.append('nailLength', String(nailLength));
  }

  try {
    const response = await axios.post(`${BASE_URL}/api/nail-tryon`, formData, {
      timeout: 120000,
    });
    if (!response.data.success) {
      throw new Error(response.data.error || 'Nail try-on failed');
    }
    return response.data;
  } catch (err) {
    throw new Error(extractError(err));
  }
}
