import callShimAdmin, { EndpointName } from 'src/edge/shim/callShimAdmin';

/**
 * Create a supply of assets
 * @param assetId The ID of the asset to supply
 * @param assetType The type of asset (usually "ASSET")
 * @param creatorId The ID of the creator
 * @param partyId The party ID for both header and request body
 * @param maximumSupply The maximum supply of the asset
 * @param availableSupply The available supply of the asset
 * @returns Promise<any>
 */
const createAssetSupply = async (
  assetId: string,
  assetType: string,
  creatorId: string,
  partyId: string,
  maximumSupply: number,
  availableSupply: number,
): Promise<any> => {
  try {
    const body = {
      assetId,
      assetType,
      creatorId,
      partyId, // Include partyId in the body as per API spec
      maximumSupply,
      availableSupply,
    };

    const response = await callShimAdmin(
      EndpointName.CREATE_ASSET_SUPPLY,
      {
        partyId, // This is for the header
      },
      body,
    );

    return response || {};
  } catch (error) {
    console.error(`createAssetSupply error: ${error.message}`);
    throw error;
  }
};

export default createAssetSupply;
