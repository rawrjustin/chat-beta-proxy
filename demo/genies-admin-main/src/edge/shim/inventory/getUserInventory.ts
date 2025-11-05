import callShimAdmin, { EndpointName } from 'src/edge/shim/callShimAdmin';
import { InventoryGetResponse } from 'src/lib/swagger/admin';

/**
 * Fetches inventory items for a user
 * @param userId The ID of the user whose inventory to retrieve
 * @param partyId The party ID required for the request header
 * @param category Optional filter by item category
 * @param color Optional filter by item color
 * @param nextCursor Optional pagination cursor for the next page of results
 * @param limit Optional maximum number of items to return
 * @returns Promise<InventoryGetResponse>
 */
const getUserInventory = async (
  userId: string,
  partyId: string,
  category?: string[],
  color?: string[],
  nextCursor?: string,
  limit?: number,
): Promise<InventoryGetResponse> => {
  try {
    // We need to pass the party-id in the headers via the options parameter
    const response = (await callShimAdmin(
      EndpointName.GET_ADMIN_USER_INVENTORY,
      {
        userId,
        category: category?.join(','), // Convert array to comma-separated string
        color: color?.join(','), // Convert array to comma-separated string
        nextCursor,
        limit,
        partyId, // This will be available in req.headers in the shim.ts
      },
    )) as InventoryGetResponse;

    return response || { data: [] };
  } catch (error) {
    console.error(`getUserInventory error: ${error.message}`);
    return { data: [] };
  }
};

export default getUserInventory;
