import callShimAdmin, { EndpointName } from 'src/edge/shim/callShimAdmin';
import {
  CreateMetadataStoreRequest,
  CreateMetadataStoreResponse,
  InventoryIndexedField,
} from 'src/lib/swagger/admin';

/**
 * Creates a new metadata store for inventory items
 * @param namespace The namespace for the metadata store
 * @param fields Array of indexed fields to create in the store
 * @param partyId The party ID required for the request header
 * @returns Promise<CreateMetadataStoreResponse>
 */
const createMetadataStore = async (
  namespace: string,
  fields: InventoryIndexedField[],
  partyId: string,
): Promise<CreateMetadataStoreResponse> => {
  try {
    // Make sure field types are uppercase
    const normalizedFields = fields.map((field) => ({
      name: field.name,
      type: field.type?.toUpperCase() || 'STRING',
    }));

    const body: CreateMetadataStoreRequest = {
      fields: normalizedFields,
    };

    const response = (await callShimAdmin(
      EndpointName.CREATE_METADATA_STORE,
      {
        namespace,
        partyId,
      },
      body,
    )) as CreateMetadataStoreResponse;

    return response || { metadataStoreKey: '' };
  } catch (error) {
    console.error(`createMetadataStore error: ${error.message}`);
    console.error('Full error:', error);
    throw error;
  }
};

export default createMetadataStore;
