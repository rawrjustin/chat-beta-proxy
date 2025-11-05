import callShimAdmin, { EndpointName } from 'src/edge/shim/callShimAdmin';
import { GetInventoryV2DecorResponse } from 'src/lib/swagger/admin';

/**
 * Fetches default decor items filtered by organization and application
 * @param orgId Optional organization ID to filter default items
 * @param appId Optional application ID to filter default items
 * @param partyId The party ID required for the request header
 * @param options Optional parameters for filtering
 * @returns Promise<GetInventoryV2DecorResponse>
 */
const getDefaultDecor = async (
  orgId?: string,
  appId?: string,
  partyId?: string,
  options?: {
    category?: string[];
    color?: string[];
    nextCursor?: string;
    limit?: number;
  },
): Promise<GetInventoryV2DecorResponse> => {
  try {
    const response = (await callShimAdmin(EndpointName.GET_DEFAULT_DECOR, {
      orgId,
      appId,
      category: options?.category?.join(','),
      color: options?.color?.join(','),
      nextCursor: options?.nextCursor,
      limit: options?.limit,
      partyId,
    })) as GetInventoryV2DecorResponse;

    return response || { decor: [] };
  } catch (error) {
    console.error(`getDefaultDecor error: ${error.message}`);
    return { decor: [] };
  }
};

export default getDefaultDecor;
