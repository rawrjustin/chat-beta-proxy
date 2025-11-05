import callShimAdmin, { EndpointName } from 'src/edge/shim/callShimAdmin';
import { GetInventoryV2AvatarBaseResponse } from 'src/lib/swagger/admin';

/**
 * Fetches default avatar base assets filtered by organization and application
 * @param orgId Optional organization ID to filter default items
 * @param appId Optional application ID to filter default items
 * @param partyId The party ID required for the request header
 * @param options Optional parameters for filtering
 * @returns Promise<GetInventoryV2AvatarBaseResponse>
 */
const getDefaultAvatarBase = async (
  orgId?: string,
  appId?: string,
  partyId?: string,
  options?: {
    category?: string[];
    color?: string[];
    nextCursor?: string;
    limit?: number;
  },
): Promise<GetInventoryV2AvatarBaseResponse> => {
  try {
    const response = (await callShimAdmin(EndpointName.GET_DEFAULT_AVATAR_DNA, {
      orgId,
      appId,
      category: options?.category?.join(','),
      color: options?.color?.join(','),
      nextCursor: options?.nextCursor,
      limit: options?.limit,
      partyId,
    })) as GetInventoryV2AvatarBaseResponse;

    return response || { avatarBase: [] };
  } catch (error) {
    console.error(`getDefaultAvatarBase error: ${error.message}`);
    return { avatarBase: [] };
  }
};

export default getDefaultAvatarBase;
