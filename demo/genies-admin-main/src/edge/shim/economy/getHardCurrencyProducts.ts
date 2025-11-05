import callShimAdmin, { EndpointName } from 'src/edge/shim/callShimAdmin';
import { GetHardCurrencyProductsWithMappingsResponse } from 'src/lib/swagger/admin';

const getHardCurrencyProducts = async (
  partyId: string,
): Promise<GetHardCurrencyProductsWithMappingsResponse> => {
  try {
    const response = (await callShimAdmin(
      EndpointName.GET_HARD_CURRENCY_PRODUCTS,
      { partyId },
    )) as GetHardCurrencyProductsWithMappingsResponse;
    return response;
  } catch (error) {
    console.error(`getHardCurrencyProducts error: ${error.message}`);
    return null;
  }
};

export default getHardCurrencyProducts;
