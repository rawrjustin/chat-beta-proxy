import callShimAdmin, { EndpointName } from 'src/edge/shim/callShimAdmin';
import { AssetModerationInfo } from 'src/lib/swagger/admin';

const getAsset = async (assetId: string): Promise<AssetModerationInfo> => {
  try {
    const response = (await callShimAdmin(
      EndpointName.GET_ASSET_MODERATION_STATUS,
      {
        assetId,
      },
    )) as AssetModerationInfo;

    return response;
  } catch (error) {
    console.error(`getAsset error: ${error.message}`);
    return null;
  }
};

export default getAsset;
