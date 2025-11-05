import callShimAdmin, { EndpointName } from 'src/edge/shim/callShimAdmin';
import { GetInventoryV2AvatarMakeupResponse } from 'src/lib/swagger/admin';

/**
 * Fetches default avatar makeup items filtered by organization and application
 * @param orgId Optional organization ID to filter default items
 * @param appId Optional application ID to filter default items
 * @param partyId The party ID required for the request header
 * @param options Optional parameters for filtering and pagination
 * @returns Promise<GetInventoryV2AvatarMakeupResponse>
 */
const getDefaultAvatarMakeup = async (
  orgId?: string,
  appId?: string,
  partyId?: string,
  options?: {
    category?: string[];
    color?: string[];
    nextCursor?: string;
    limit?: number;
  },
): Promise<GetInventoryV2AvatarMakeupResponse> => {
  try {
    const params: any = { partyId };
    if (orgId) params.orgId = orgId;
    if (appId) params.appId = appId;
    if (options?.category) params.category = options.category.join(',');
    if (options?.color) params.color = options.color.join(',');
    if (options?.nextCursor) params.nextCursor = options.nextCursor;
    if (options?.limit) params.limit = options.limit;

    const response = (await callShimAdmin(
      EndpointName.GET_DEFAULT_AVATAR_MAKEUP,
      params,
    )) as GetInventoryV2AvatarMakeupResponse;

    return response || { avatarMakeup: [] };
  } catch (error) {
    console.error(`getDefaultAvatarMakeup error: ${error.message}`);
    return { avatarMakeup: [] };
  }
};

export default getDefaultAvatarMakeup;
