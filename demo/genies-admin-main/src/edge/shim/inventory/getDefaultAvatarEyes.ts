import callShimAdmin, { EndpointName } from 'src/edge/shim/callShimAdmin';
import { GetInventoryV2AvatarEyesResponse } from 'src/lib/swagger/admin';

/**
 * Fetches default avatar eyes items filtered by organization and application
 * @param orgId Optional organization ID to filter default items
 * @param appId Optional application ID to filter default items
 * @param partyId The party ID required for the request header
 * @param options Optional parameters for filtering and pagination
 * @returns Promise<GetInventoryV2AvatarEyesResponse>
 */
const getDefaultAvatarEyes = async (
  orgId?: string,
  appId?: string,
  partyId?: string,
  options?: {
    category?: string[];
    color?: string[];
    nextCursor?: string;
    limit?: number;
  },
): Promise<GetInventoryV2AvatarEyesResponse> => {
  try {
    const params: any = { partyId };
    if (orgId) params.orgId = orgId;
    if (appId) params.appId = appId;
    if (options?.category) params.category = options.category.join(',');
    if (options?.color) params.color = options.color.join(',');
    if (options?.nextCursor) params.nextCursor = options.nextCursor;
    if (options?.limit) params.limit = options.limit;

    const response = (await callShimAdmin(
      EndpointName.GET_DEFAULT_AVATAR_EYES,
      params,
    )) as GetInventoryV2AvatarEyesResponse;

    return response || { avatarEyes: [] };
  } catch (error) {
    console.error(`getDefaultAvatarEyes error: ${error.message}`);
    return { avatarEyes: [] };
  }
};

export default getDefaultAvatarEyes;
