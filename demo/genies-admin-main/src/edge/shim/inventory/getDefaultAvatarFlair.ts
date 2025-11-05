import callShimAdmin, { EndpointName } from 'src/edge/shim/callShimAdmin';
import { GetInventoryV2AvatarFlairResponse } from 'src/lib/swagger/admin';

/**
 * Fetches default avatar flair items filtered by organization and application
 * @param orgId Optional organization ID to filter default items
 * @param appId Optional application ID to filter default items
 * @param partyId The party ID required for the request header
 * @param options Optional parameters for filtering and pagination
 * @returns Promise<GetInventoryV2AvatarFlairResponse>
 */
const getDefaultAvatarFlair = async (
  orgId?: string,
  appId?: string,
  partyId?: string,
  options?: {
    category?: string[];
    color?: string[];
    nextCursor?: string;
    limit?: number;
  },
): Promise<GetInventoryV2AvatarFlairResponse> => {
  try {
    const params: any = { partyId };
    if (orgId) params.orgId = orgId;
    if (appId) params.appId = appId;
    if (options?.category) params.category = options.category.join(',');
    if (options?.color) params.color = options.color.join(',');
    if (options?.nextCursor) params.nextCursor = options.nextCursor;
    if (options?.limit) params.limit = options.limit;

    const response = (await callShimAdmin(
      EndpointName.GET_DEFAULT_AVATAR_FLAIR,
      params,
    )) as GetInventoryV2AvatarFlairResponse;

    return response || { avatarFlair: [] };
  } catch (error) {
    console.error(`getDefaultAvatarFlair error: ${error.message}`);
    return { avatarFlair: [] };
  }
};

export default getDefaultAvatarFlair;
