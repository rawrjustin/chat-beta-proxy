import callShimAdmin, { EndpointName } from 'src/edge/shim/callShimAdmin';

/**
 * Gets metadata store information by namespace
 * @param namespace The namespace for the metadata store
 * @param partyId The party ID required for the request header
 * @returns Promise<any>
 */
const getMetadataStore = async (
  namespace: string,
  partyId: string,
): Promise<any> => {
  try {
    console.log(
      `getMetadataStore called with namespace: ${namespace}, partyId: ${partyId}`,
    );

    const response = await callShimAdmin(EndpointName.GET_METADATA_STORE, {
      namespace,
      partyId,
    });

    console.log('getMetadataStore response:', response);
    return response || {};
  } catch (error) {
    console.error(`getMetadataStore error: ${error.message}`);
    console.error('Error details:', error);
    throw error;
  }
};

export default getMetadataStore;
