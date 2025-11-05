import axios from 'axios';
import Logger from 'shared/logger';
import { MobileCmsData, MobileCmsParams } from 'src/pages/api/mobilecms';

/**
 * client request to nextjs backend to
 * query mobile cms via mobile backend API
 * @param params assetAddress check if it exists
 * @returns if assetGuid exists, [{ assetGuid, asset_address }]
 * otherwise it will return null
 * example: callMobileCms({ assetAddress: 'shirt-0010-button_skin0007' })
 */
export default async function callMobileCms(
  params: MobileCmsParams,
): Promise<MobileCmsData[] | null> {
  try {
    const res = await axios.get(`/api/mobilecms`, { params });
    return res.data;
  } catch (error) {
    Logger.getInstance().error(`callMobileCms error: ${error.message}`, {
      errorMessage: error.message,
      source: 'callMobileCms',
    });
  }
  return null;
}
