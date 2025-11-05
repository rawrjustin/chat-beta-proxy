import callShimAdmin, { EndpointName } from 'src/edge/shim/callShimAdmin';
import { GetActiveSoftCurrencyProductsResponse } from 'src/lib/swagger/admin';

const getAllSoftCurrencyProducts = async (
  currencyId: string,
  include_inactive: boolean,
  include_metadata: boolean,
): Promise<GetActiveSoftCurrencyProductsResponse> => {
  try {
    const response = (await callShimAdmin(
      EndpointName.GET_ALL_SOFT_CURRENCY_PRODUCTS,
      { currencyId, include_inactive, include_metadata },
    )) as GetActiveSoftCurrencyProductsResponse;
    return response;
  } catch (error) {
    console.error(`getAllSoftCurrencyProducts error: ${error.message}`);
    return null;
  }
};

export default getAllSoftCurrencyProducts;
