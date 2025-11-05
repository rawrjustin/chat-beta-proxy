import callShimAdmin, { EndpointName } from 'src/edge/shim/callShimAdmin';
import { GetInventoryV2GearResponse } from 'src/lib/swagger/admin';

/**
 * Fetches default gear items filtered by organization and application
 * @param orgId Optional organization ID to filter default items
 * @param appId Optional application ID to filter default items
 * @param partyId The party ID required for the request header
 * @param options Optional parameters for filtering
 * @returns Promise<GetInventoryV2GearResponse>
 */
const getDefaultGear = async (
  orgId?: string,
  appId?: string,
  partyId?: string,
  options?: {
    category?: string[];
    color?: string[];
    nextCursor?: string;
    limit?: number;
  },
): Promise<GetInventoryV2GearResponse> => {
  try {
    // Build query params, only include orgId/appId if they have values
    const params: any = {
      partyId,
    };
    if (orgId) params.orgId = orgId;
    if (appId) params.appId = appId;
    if (options?.category) params.category = options.category.join(',');
    if (options?.color) params.color = options.color.join(',');
    if (options?.nextCursor) params.nextCursor = options.nextCursor;
    if (options?.limit) params.limit = options.limit;

    const response = (await callShimAdmin(
      EndpointName.GET_DEFAULT_GEAR,
      params,
    )) as GetInventoryV2GearResponse;

    return response || { gear: [] };
  } catch (error) {
    console.error(`getDefaultGear error: ${error.message}`);
    return { gear: [] };
  }
};

export default getDefaultGear;
