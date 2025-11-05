import callShimAdmin, { EndpointName } from 'src/edge/shim/callShimAdmin';

/**
 * Mint an asset to a user's inventory
 * @param assetId The ID of the asset to mint
 * @param ownerId The ID of the user to mint the asset to
 * @param headerPartyId The party ID required for the request header
 * @param partyId Optional party ID to store as metadata
 * @param orgId Optional organization ID to store as metadata
 * @param experienceId Optional experience ID to store as metadata
 * @param assetType Optional asset type (e.g., WEARABLE, DECOR, AVATAR)
 * @returns Promise<any>
 */
const mintAsset = async (
  assetId: string,
  ownerId: string,
  headerPartyId: string,
  partyId?: string,
  orgId?: string,
  experienceId?: string,
  assetType?: string,
): Promise<any> => {
  try {
    // Build the request body with only defined fields
    const body: Record<string, any> = {
      assetId,
      ownerId,
    };

    // Add optional metadata fields if provided
    if (partyId) body.partyId = partyId;
    if (orgId) body.orgId = orgId;
    if (experienceId) body.experienceId = experienceId;
    if (assetType) body.assetType = assetType;

    const response = await callShimAdmin(
      EndpointName.MINT_ASSET,
      {
        partyId: headerPartyId, // This is for the header
      },
      body,
    );

    return response || {};
  } catch (error) {
    console.error(`mintAsset error: ${error.message}`);
    throw error;
  }
};

export default mintAsset;
