import callShimAdmin, { EndpointName } from 'src/edge/shim/callShimAdmin';
import { GetInventoryV2AvatarMakeupResponse } from 'src/lib/swagger/admin';

/**
 * Fetches V2 avatar makeup inventory items for a user
 * @param userId The ID of the user whose avatar makeup to retrieve
 * @param partyId The party ID required for the request header
 * @param options Optional parameters for filtering
 * @returns Promise<GetInventoryV2AvatarMakeupResponse>
 */
const getInventoryV2AvatarMakeup = async (
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
): Promise<GetInventoryV2AvatarMakeupResponse> => {
  try {
    const response = (await callShimAdmin(
      EndpointName.GET_INVENTORY_V2_AVATAR_MAKEUP,
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
    )) as GetInventoryV2AvatarMakeupResponse;

    return response || { avatarMakeup: [] };
  } catch (error) {
    console.error(`getInventoryV2AvatarMakeup error: ${error.message}`);
    return { avatarMakeup: [] };
  }
};

export default getInventoryV2AvatarMakeup;
