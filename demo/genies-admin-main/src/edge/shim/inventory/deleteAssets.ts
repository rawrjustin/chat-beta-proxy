import callShimAdmin, { EndpointName } from 'src/edge/shim/callShimAdmin';

/**
 * Delete/burn multiple asset instances from user inventory (bulk operation)
 * @param assetIds Array of asset instance IDs to delete
 * @param partyId The party ID required for the request header
 * @returns Promise<any>
 */
const deleteAssets = async (
  assetIds: string[],
  partyId: string,
): Promise<any> => {
  try {
    const body = {
      assetIds,
    };

    const response = await callShimAdmin(
      EndpointName.DELETE_ASSETS,
      {
        partyId, // This is for the header
      },
      body,
    );

    return response || { deletedIds: [], failedIds: [] };
  } catch (error) {
    console.error(`deleteAssets error: ${error.message}`);
    throw error;
  }
};

export default deleteAssets;
