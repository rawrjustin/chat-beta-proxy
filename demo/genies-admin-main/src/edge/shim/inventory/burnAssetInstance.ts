import callShimAdmin, { EndpointName } from 'src/edge/shim/callShimAdmin';

/**
 * Delete/burn a single asset instance from user inventory
 * @param instanceId The asset instance ID to delete
 * @param partyId The party ID required for the request header
 * @returns Promise<any>
 */
const burnAssetInstance = async (
  instanceId: string,
  partyId: string,
): Promise<any> => {
  try {
    const response = await callShimAdmin(EndpointName.BURN_ASSET_INSTANCE, {
      instanceId, // This goes as query parameter
      partyId, // This is for the header
    });

    return response || { success: false };
  } catch (error) {
    console.error(`burnAssetInstance error: ${error.message}`);
    throw error;
  }
};

export default burnAssetInstance;
