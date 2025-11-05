import callShimAdmin, { EndpointName } from 'src/edge/shim/callShimAdmin';
import { GetInventoryV2ColorPresetsResponse } from 'src/lib/swagger/admin';

/**
 * Fetches V2 color presets inventory items for a user
 * @param userId The ID of the user whose color presets to retrieve
 * @param partyId The party ID required for the request header
 * @param options Optional parameters for filtering
 * @returns Promise<GetInventoryV2ColorPresetsResponse>
 */
const getInventoryV2ColorPresets = async (
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
): Promise<GetInventoryV2ColorPresetsResponse> => {
  try {
    const response = (await callShimAdmin(
      EndpointName.GET_INVENTORY_V2_COLOR_PRESETS,
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
    )) as GetInventoryV2ColorPresetsResponse;

    return response || { colorPresets: [] };
  } catch (error) {
    console.error(`getInventoryV2ColorPresets error: ${error.message}`);
    return { colorPresets: [] };
  }
};

export default getInventoryV2ColorPresets;
