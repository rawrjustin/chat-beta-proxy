import callShimAdmin, { EndpointName } from 'src/edge/shim/callShimAdmin';
import { GetAllHardCurrencyProductMetadataResponse } from 'src/lib/swagger/admin';

const getAllHCProductMetadata =
  async (): Promise<GetAllHardCurrencyProductMetadataResponse> => {
    try {
      const response = (await callShimAdmin(
        EndpointName.GET_ALL_HC_PRODUCT_METADATA,
        {},
      )) as GetAllHardCurrencyProductMetadataResponse;
      return response;
    } catch (error) {
      console.error(`getAllHCProductMetadata error: ${error.message}`);
      return null;
    }
  };

export default getAllHCProductMetadata;
