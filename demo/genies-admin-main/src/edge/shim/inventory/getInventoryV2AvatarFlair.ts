import callShimAdmin, { EndpointName } from 'src/edge/shim/callShimAdmin';
import { GetInventoryV2AvatarFlairResponse } from 'src/lib/swagger/admin';

/**
 * Fetches V2 avatar flair inventory items for a user
 * @param userId The ID of the user whose avatar flair to retrieve
 * @param partyId The party ID required for the request header
 * @param options Optional parameters for filtering
 * @returns Promise<GetInventoryV2AvatarFlairResponse>
 */
const getInventoryV2AvatarFlair = async (
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
): Promise<GetInventoryV2AvatarFlairResponse> => {
  try {
    const response = (await callShimAdmin(
      EndpointName.GET_INVENTORY_V2_AVATAR_FLAIR,
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
    )) as GetInventoryV2AvatarFlairResponse;

    return response || { avatarFlair: [] };
  } catch (error) {
    console.error(`getInventoryV2AvatarFlair error: ${error.message}`);
    return { avatarFlair: [] };
  }
};

export default getInventoryV2AvatarFlair;
