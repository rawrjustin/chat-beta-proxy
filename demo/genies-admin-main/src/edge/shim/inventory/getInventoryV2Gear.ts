import callShimAdmin, { EndpointName } from 'src/edge/shim/callShimAdmin';
import { GetInventoryV2GearResponse } from 'src/lib/swagger/admin';

/**
 * Fetches V2 gear inventory items for a user
 * @param userId The ID of the user whose gear inventory to retrieve
 * @param partyId The party ID required for the request header
 * @param options Optional parameters for filtering
 * @returns Promise<GetInventoryV2GearResponse>
 */
const getInventoryV2Gear = async (
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
): Promise<GetInventoryV2GearResponse> => {
  try {
    const response = (await callShimAdmin(EndpointName.GET_INVENTORY_V2_GEAR, {
      userId,
      appId: options?.appId,
      orgId: options?.orgId,
      category: options?.category?.join(','),
      subcategory: options?.subcategory?.join(','),
      color: options?.color?.join(','),
      nextCursor: options?.nextCursor,
      limit: options?.limit,
      partyId,
    })) as GetInventoryV2GearResponse;

    return response || { gear: [] };
  } catch (error) {
    console.error(`getInventoryV2Gear error: ${error.message}`);
    return { gear: [] };
  }
};

export default getInventoryV2Gear;
