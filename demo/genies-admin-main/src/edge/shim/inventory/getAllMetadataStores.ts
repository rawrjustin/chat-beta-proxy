import callShimAdmin, { EndpointName } from 'src/edge/shim/callShimAdmin';
import { GetAllStoresResponse } from 'src/lib/swagger/admin';

/**
 * Gets all metadata stores
 * @param params - Optional query parameters (type, appId, limit, nextCursor)
 * @returns Promise<GetAllStoresResponse>
 */
const getAllMetadataStores = async (params?: {
  type?: string;
  appId?: string;
  limit?: number;
  nextCursor?: string;
}): Promise<GetAllStoresResponse> => {
  try {
    const response = (await callShimAdmin(
      EndpointName.GET_ALL_METADATA_STORES,
      params,
    )) as GetAllStoresResponse;

    return (
      response || {
        stores: [],
        total: 0,
      }
    );
  } catch (error) {
    console.error(`getAllMetadataStores error:`, error);
    throw error; // Re-throw to let the component handle it
  }
};

export default getAllMetadataStores;
