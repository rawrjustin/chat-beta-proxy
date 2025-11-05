import callShimAdmin, { EndpointName } from 'src/edge/shim/callShimAdmin';
import { DeleteSoftCurrencyProductResponse } from 'src/lib/swagger/admin';

const deleteSoftCurrencyProduct = async (
  currencyId: string,
  productSku: string,
): Promise<DeleteSoftCurrencyProductResponse> => {
  try {
    const response = (await callShimAdmin(
      EndpointName.DELETE_SOFT_CURRENCY_PRODUCT,
      { currencyId, productSku },
    )) as DeleteSoftCurrencyProductResponse;
    return response;
  } catch (error) {
    console.error(`deleteSoftCurrencyProduct error: ${error.message}`);
    return null;
  }
};

export default deleteSoftCurrencyProduct;
