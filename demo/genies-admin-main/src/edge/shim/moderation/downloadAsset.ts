import axios from 'axios';

type DownloadResponse = {
  signedURL: string;
};

const downloadAsset = async (assetKey: string): Promise<DownloadResponse> => {
  try {
    const res = await axios.get<{ signedUrl: string }>(
      `/api/download?url=${encodeURIComponent(assetKey)}`,
    );
    return {
      signedURL: res.data.signedUrl,
    };
  } catch (error) {
    console.error(`downloadAsset error: ${error.message}`);
    return {
      signedURL: assetKey,
    };
  }
};

export default downloadAsset;
