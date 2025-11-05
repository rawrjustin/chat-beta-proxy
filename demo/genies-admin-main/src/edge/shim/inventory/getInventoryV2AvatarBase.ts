import callShimAdmin, { EndpointName } from 'src/edge/shim/callShimAdmin';
import { GetInventoryV2AvatarBaseResponse } from 'src/lib/swagger/admin';

/**
 * Fetches V2 avatar base inventory items for a user
 * @param userId The ID of the user whose avatar base to retrieve
 * @param partyId The party ID required for the request header
 * @param options Optional parameters for filtering
 * @returns Promise<GetInventoryV2AvatarBaseResponse>
 */
const getInventoryV2AvatarBase = async (
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
): Promise<GetInventoryV2AvatarBaseResponse> => {
  try {
    const response = (await callShimAdmin(
      EndpointName.GET_INVENTORY_V2_AVATAR_DNA,
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
    )) as GetInventoryV2AvatarBaseResponse;

    return response || { avatarBase: [] };
  } catch (error) {
    console.error(`getInventoryV2AvatarBase error: ${error.message}`);
    return { avatarBase: [] };
  }
};

export default getInventoryV2AvatarBase;
