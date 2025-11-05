import callShimAdmin, { EndpointName } from 'src/edge/shim/callShimAdmin';
import { GetInventoryV2AvatarEyesResponse } from 'src/lib/swagger/admin';

/**
 * Fetches V2 avatar eyes inventory items for a user
 * @param userId The ID of the user whose avatar eyes to retrieve
 * @param partyId The party ID required for the request header
 * @param options Optional parameters for filtering
 * @returns Promise<GetInventoryV2AvatarEyesResponse>
 */
const getInventoryV2AvatarEyes = async (
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
): Promise<GetInventoryV2AvatarEyesResponse> => {
  try {
    const response = (await callShimAdmin(
      EndpointName.GET_INVENTORY_V2_AVATAR_EYES,
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
    )) as GetInventoryV2AvatarEyesResponse;

    return response || { avatarEyes: [] };
  } catch (error) {
    console.error(`getInventoryV2AvatarEyes error: ${error.message}`);
    return { avatarEyes: [] };
  }
};

export default getInventoryV2AvatarEyes;
