import callShimAdmin, { EndpointName } from 'src/edge/shim/callShimAdmin';
import { AddHardCurrencyProductResponse } from 'src/lib/swagger/admin';

const addHardCurrencyProduct = async (
  productSku: string,
  amount: number,
  isActive: boolean,
): Promise<AddHardCurrencyProductResponse> => {
  try {
    const response = (await callShimAdmin(
      EndpointName.ADD_HARD_CURRENCY_PRODUCT,
      {},
      {
        productSku: productSku,
        amount: amount,
        isActive: isActive,
      },
    )) as AddHardCurrencyProductResponse;
    return response;
  } catch (error) {
    console.error(`addHardCurrencyProduct error: ${error.message}`);
    return null;
  }
};

export default addHardCurrencyProduct;
