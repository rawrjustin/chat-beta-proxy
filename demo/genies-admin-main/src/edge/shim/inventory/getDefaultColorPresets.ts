import callShimAdmin, { EndpointName } from 'src/edge/shim/callShimAdmin';
import { GetInventoryV2ColorPresetsResponse } from 'src/lib/swagger/admin';

/**
 * Fetches default color presets filtered by organization and application
 * @param orgId Optional organization ID to filter default items
 * @param appId Optional application ID to filter default items
 * @param partyId The party ID required for the request header
 * @param options Optional parameters for filtering and pagination
 * @returns Promise<GetInventoryV2ColorPresetsResponse>
 */
const getDefaultColorPresets = async (
  orgId?: string,
  appId?: string,
  partyId?: string,
  options?: {
    category?: string[];
    color?: string[];
    nextCursor?: string;
    limit?: number;
  },
): Promise<GetInventoryV2ColorPresetsResponse> => {
  try {
    const params: any = { partyId };
    if (orgId) params.orgId = orgId;
    if (appId) params.appId = appId;
    if (options?.category) params.category = options.category.join(',');
    if (options?.color) params.color = options.color.join(',');
    if (options?.nextCursor) params.nextCursor = options.nextCursor;
    if (options?.limit) params.limit = options.limit;

    const response = (await callShimAdmin(
      EndpointName.GET_DEFAULT_COLOR_PRESETS,
      params,
    )) as GetInventoryV2ColorPresetsResponse;

    return response || { colorPresets: [] };
  } catch (error) {
    console.error(`getDefaultColorPresets error: ${error.message}`);
    return { colorPresets: [] };
  }
};

export default getDefaultColorPresets;
