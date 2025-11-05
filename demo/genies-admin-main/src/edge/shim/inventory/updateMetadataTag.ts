import callShimAdmin, { EndpointName } from 'src/edge/shim/callShimAdmin';
import {
  UpdateMetadataTagRequest,
  UpdateMetadataTagResponse,
} from 'src/lib/swagger/admin';

/**
 * Updates a metadata tag
 * @param tagId The ID of the tag to update
 * @param namespace The namespace of the metadata store
 * @param metadataStoreKey The metadata store key
 * @param request The update request body
 * @returns Promise<UpdateMetadataTagResponse>
 */
const updateMetadataTag = async (
  tagId: string,
  namespace: string,
  metadataStoreKey: string,
  request: UpdateMetadataTagRequest,
): Promise<UpdateMetadataTagResponse> => {
  try {
    const response = (await callShimAdmin(
      EndpointName.UPDATE_METADATA_TAG,
      {
        tagId,
        namespace,
        metadataStoreKey,
      },
      request,
    )) as UpdateMetadataTagResponse;

    return (
      response || {
        success: false,
        tag: {
          id: tagId,
          body: {},
        },
      }
    );
  } catch (error) {
    console.error(`updateMetadataTag error: ${error.message}`);
    throw error;
  }
};

export default updateMetadataTag;
