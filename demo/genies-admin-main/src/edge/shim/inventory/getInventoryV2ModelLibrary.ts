import callShimAdmin, { EndpointName } from 'src/edge/shim/callShimAdmin';
import { GetInventoryV2ModelLibraryResponse } from 'src/lib/swagger/admin';

/**
 * Fetches V2 model library inventory items for a user
 * @param userId The ID of the user whose model library to retrieve
 * @param partyId The party ID required for the request header
 * @param options Optional parameters for filtering
 * @returns Promise<GetInventoryV2ModelLibraryResponse>
 */
const getInventoryV2ModelLibrary = async (
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
): Promise<GetInventoryV2ModelLibraryResponse> => {
  try {
    const response = (await callShimAdmin(
      EndpointName.GET_INVENTORY_V2_MODEL_LIBRARY,
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
    )) as GetInventoryV2ModelLibraryResponse;

    return response || { modelLibrary: [] };
  } catch (error) {
    console.error(`getInventoryV2ModelLibrary error: ${error.message}`);
    return { modelLibrary: [] };
  }
};

export default getInventoryV2ModelLibrary;
