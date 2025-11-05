import callShimAdmin, { EndpointName } from 'src/edge/shim/callShimAdmin';
import {
  SetMetadataTagsRequest,
  SetMetadataTagsResponse,
  InventoryMetadataTag,
} from 'src/lib/swagger/admin';

/**
 * Sets metadata tags for inventory items
 * @param tags Array of metadata tag objects to set
 * @param namespace The namespace of the metadatastore
 * @param metadataStoreKey The key of the metadata store
 * @param partyId The party ID required for the request header
 * @returns Promise<SetMetadataTagsResponse>
 */
const setMetadataTag = async (
  tags: InventoryMetadataTag | InventoryMetadataTag[],
  namespace: string,
  metadataStoreKey: string,
  partyId: string,
): Promise<SetMetadataTagsResponse> => {
  try {
    // Ensure inputs are trimmed to avoid URL encoding issues
    const trimmedNamespace = namespace.trim();
    const trimmedMetadataStoreKey = metadataStoreKey.trim();

    if (!trimmedNamespace) {
      throw new Error('Namespace cannot be empty');
    }

    if (!trimmedMetadataStoreKey) {
      throw new Error('Metadata Store Key cannot be empty');
    }

    // Convert single tag to array if needed
    const tagsArray = Array.isArray(tags) ? tags : [tags];

    const body: SetMetadataTagsRequest = {
      tags: tagsArray,
    };

    const response = (await callShimAdmin(
      EndpointName.SET_METADATA_TAG,
      {
        namespace: trimmedNamespace,
        metadataStoreKey: trimmedMetadataStoreKey,
        partyId,
      },
      body,
    )) as SetMetadataTagsResponse;

    return response || {};
  } catch (error) {
    console.error(`setMetadataTag error: ${error.message}`);
    console.error('Full error:', error);

    // Add specific error handling
    if (error.response && error.response.data) {
      console.error('Error response data:', error.response.data);
    }

    throw error;
  }
};

export default setMetadataTag;
