import callShimAdmin, { EndpointName } from 'src/edge/shim/callShimAdmin';
import { GetMetadataTagResponse } from 'src/lib/swagger/admin';

/**
 * Gets a metadata tag by its ID
 * @param tagId The ID of the tag to get
 * @param namespace The namespace of the metadatastore
 * @param partyId The party ID required for the request header
 * @returns Promise<GetMetadataTagResponse>
 */
const getMetadataTag = async (
  tagId: string,
  namespace: string,
  partyId: string,
): Promise<GetMetadataTagResponse> => {
  try {
    console.log(`Getting metadata tag:`, {
      tagId,
      namespace,
      partyId,
    });

    const response = (await callShimAdmin(EndpointName.GET_METADATA_TAG, {
      tagId,
      namespace,
      partyId,
    })) as GetMetadataTagResponse;

    console.log('getMetadataTag response:', JSON.stringify(response, null, 2));
    return response || { tag: null };
  } catch (error) {
    console.error(`getMetadataTag error: ${error.message}`);

    // Log more details about the error for debugging
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      console.error('Error response headers:', error.response.headers);
    } else if (error.request) {
      console.error('Error request:', error.request);
    }

    console.error('Full error:', error);
    throw error;
  }
};

export default getMetadataTag;
