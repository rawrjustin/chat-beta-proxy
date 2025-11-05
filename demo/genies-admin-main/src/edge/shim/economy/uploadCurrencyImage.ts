import axios from 'axios';
import Logger from '../../../../shared/logger';

/**
 * Uploads a currency image (for either currencies or currency products) to S3
 * @param imageFile The image file to upload
 * @param type Optional type parameter to differentiate currency types (defaults to 'currency')
 * @returns The API response containing the uploaded image URL
 */
const uploadCurrencyImage = async (
  imageFile: File,
  type: 'currency' | 'product' = 'currency',
) => {
  if (!imageFile) {
    return { error: 'No image file selected' };
  }

  const headers = {
    'content-type': imageFile.type,
    'x-filename': imageFile.name,
    'x-filetype': imageFile.type,
    'x-image-type': type, // Add a header to identify the type of upload
  };

  try {
    const res = await axios.post(`/api/uploadCurrency`, imageFile, {
      headers,
    });

    return res;
  } catch (e) {
    Logger.getInstance().error(
      `Upload File Error: ${e?.response?.data?.error} `,
      {
        errorMessage: e.message,
        source: 'uploadCurrencyImage',
      },
    );
    return { error: e.message };
  }
};

export default uploadCurrencyImage;
