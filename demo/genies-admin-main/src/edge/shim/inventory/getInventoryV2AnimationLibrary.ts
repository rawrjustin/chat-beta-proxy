import callShimAdmin, { EndpointName } from 'src/edge/shim/callShimAdmin';
import { GetInventoryV2AnimationLibraryResponse } from 'src/lib/swagger/admin';

/**
 * Fetches V2 animation library inventory items for a user
 * @param userId The ID of the user whose animation library to retrieve
 * @param partyId The party ID required for the request header
 * @param options Optional parameters for filtering
 * @returns Promise<GetInventoryV2AnimationLibraryResponse>
 */
const getInventoryV2AnimationLibrary = async (
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
): Promise<GetInventoryV2AnimationLibraryResponse> => {
  try {
    const response = (await callShimAdmin(
      EndpointName.GET_INVENTORY_V2_ANIMATION_LIBRARY,
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
    )) as GetInventoryV2AnimationLibraryResponse;

    return response || { animationLibrary: [] };
  } catch (error) {
    console.error(`getInventoryV2AnimationLibrary error: ${error.message}`);
    return { animationLibrary: [] };
  }
};

export default getInventoryV2AnimationLibrary;
