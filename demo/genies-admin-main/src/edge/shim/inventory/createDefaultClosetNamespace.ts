import callShimAdmin, { EndpointName } from 'src/edge/shim/callShimAdmin';
import { CreateDefaultClosetNamespaceResponse } from 'src/lib/swagger/admin';

/**
 * Creates the tag_defaultCloset metadata namespace with indexed fields for orgId, appId, and isDefault
 * @returns Promise<CreateDefaultClosetNamespaceResponse>
 */
const createDefaultClosetNamespace =
  async (): Promise<CreateDefaultClosetNamespaceResponse> => {
    try {
      const response = (await callShimAdmin(
        EndpointName.CREATE_DEFAULT_CLOSET_NAMESPACE,
      )) as CreateDefaultClosetNamespaceResponse;

      return response;
    } catch (error) {
      console.error(`createDefaultClosetNamespace error: ${error.message}`);
      throw error;
    }
  };

export default createDefaultClosetNamespace;
