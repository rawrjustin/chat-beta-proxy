import callShimAdmin, { EndpointName } from 'src/edge/shim/callShimAdmin';
import { UpdateHardCurrencyProductResponse } from 'src/lib/swagger/admin';

const updateHardCurrencyProduct = async (
  productSku: string,
  amount: number,
  isActive: boolean,
): Promise<UpdateHardCurrencyProductResponse> => {
  try {
    const response = (await callShimAdmin(
      EndpointName.UPDATE_HARD_CURRENCY_PRODUCT,
      {},
      {
        productSku: productSku,
        amount: amount,
        isActive: isActive,
      },
    )) as UpdateHardCurrencyProductResponse;
    return response;
  } catch (error) {
    console.error(`updateHardCurrencyProduct error: ${error.message}`);
    return null;
  }
};

export default updateHardCurrencyProduct;
