import callShimAdmin, { EndpointName } from 'src/edge/shim/callShimAdmin';
import {
  CreateDefaultItemRequest,
  CreateDefaultItemResponse,
} from 'src/lib/swagger/admin';

/**
 * Creates an asset supply and tags it with the tag_defaultCloset namespace
 * @param request - The default item creation request
 * @returns Promise<CreateDefaultItemResponse>
 */
const createDefaultItem = async (
  request: CreateDefaultItemRequest,
): Promise<CreateDefaultItemResponse> => {
  try {
    const response = (await callShimAdmin(
      EndpointName.CREATE_DEFAULT_ITEM,
      {},
      request,
    )) as CreateDefaultItemResponse;

    return response;
  } catch (error) {
    console.error(`createDefaultItem error: ${error.message}`);
    throw error;
  }
};

export default createDefaultItem;
