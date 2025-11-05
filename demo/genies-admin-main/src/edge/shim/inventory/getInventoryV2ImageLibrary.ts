import callShimAdmin, { EndpointName } from 'src/edge/shim/callShimAdmin';
import { GetInventoryV2ImageLibraryResponse } from 'src/lib/swagger/admin';

/**
 * Fetches V2 image library inventory items for a user
 * @param userId The ID of the user whose image library to retrieve
 * @param partyId The party ID required for the request header
 * @param options Optional parameters for filtering
 * @returns Promise<GetInventoryV2ImageLibraryResponse>
 */
const getInventoryV2ImageLibrary = async (
  userId: string,
  partyId: string,
  options?: {
    appId?: string;
    orgId?: string;
    category?: string[];
    subcategory?: string[];
    color?: string[];
    nextCursor?: string;
    limit?: number;
  },
): Promise<GetInventoryV2ImageLibraryResponse> => {
  try {
    const response = (await callShimAdmin(
      EndpointName.GET_INVENTORY_V2_IMAGE_LIBRARY,
      {
        userId,
        appId: options?.appId,
        orgId: options?.orgId,
        category: options?.category?.join(','),
        subcategory: options?.subcategory?.join(','),
        color: options?.color?.join(','),
        nextCursor: options?.nextCursor,
        limit: options?.limit,
        partyId,
      },
    )) as GetInventoryV2ImageLibraryResponse;

    return response || { imageLibrary: [] };
  } catch (error) {
    console.error(`getInventoryV2ImageLibrary error: ${error.message}`);
    return { imageLibrary: [] };
  }
};

export default getInventoryV2ImageLibrary;
