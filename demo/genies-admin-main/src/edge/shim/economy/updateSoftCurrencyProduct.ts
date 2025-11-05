import callShimAdmin, { EndpointName } from 'src/edge/shim/callShimAdmin';
import { UpdateSoftCurrencyProductResponse } from 'src/lib/swagger/admin';

const updateSoftCurrencyProduct = async (
  currencyId: string,
  productSku: string,
  amount: number,
  hcCost: number,
  isActive: boolean,
  title: string,
  description: string,
  iconUrl: string,
): Promise<UpdateSoftCurrencyProductResponse> => {
  try {
    const response = (await callShimAdmin(
      EndpointName.UPDATE_SOFT_CURRENCY_PRODUCT,
      {},
      {
        currencyId: currencyId,
        productSku: productSku,
        amount: amount,
        hcCost: hcCost,
        isActive: isActive,
        metadata: {
          title: title,
          description: description,
          iconUrl: iconUrl,
        },
      },
    )) as UpdateSoftCurrencyProductResponse;
    return response;
  } catch (error) {
    console.error(`updateSoftCurrencyProduct error: ${error.message}`);
    return null;
  }
};

export default updateSoftCurrencyProduct;
