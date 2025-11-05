import callShimAdmin, { EndpointName } from 'src/edge/shim/callShimAdmin';
import { GetInventoryV2ImageLibraryResponse } from 'src/lib/swagger/admin';

/**
 * Fetches default image library items filtered by organization and application
 * @param orgId Optional organization ID to filter default items
 * @param appId Optional application ID to filter default items
 * @param partyId The party ID required for the request header
 * @param options Optional parameters for filtering and pagination
 * @returns Promise<GetInventoryV2ImageLibraryResponse>
 */
const getDefaultImageLibrary = async (
  orgId?: string,
  appId?: string,
  partyId?: string,
  options?: {
    category?: string[];
    color?: string[];
    nextCursor?: string;
    limit?: number;
  },
): Promise<GetInventoryV2ImageLibraryResponse> => {
  try {
    const params: any = { partyId };
    if (orgId) params.orgId = orgId;
    if (appId) params.appId = appId;
    if (options?.category) params.category = options.category.join(',');
    if (options?.color) params.color = options.color.join(',');
    if (options?.nextCursor) params.nextCursor = options.nextCursor;
    if (options?.limit) params.limit = options.limit;

    const response = (await callShimAdmin(
      EndpointName.GET_DEFAULT_IMAGE_LIBRARY,
      params,
    )) as GetInventoryV2ImageLibraryResponse;

    return response || { imageLibrary: [] };
  } catch (error) {
    console.error(`getDefaultImageLibrary error: ${error.message}`);
    return { imageLibrary: [] };
  }
};

export default getDefaultImageLibrary;
