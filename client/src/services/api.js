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

export async function applyNailTryon(imageFile, { nailColor, nailTexture }) {
  const formData = new FormData();
  formData.append('image', imageFile);
  formData.append('nailColor', nailColor);
  formData.append('nailTexture', nailTexture);

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
