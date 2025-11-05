import callShimAdmin, { EndpointName } from 'src/edge/shim/callShimAdmin';
import { AddSoftCurrencyProductResponse } from 'src/lib/swagger/admin';

const addSoftCurrencyProduct = async (
  currencyId: string,
  productSku: string,
  amount: number,
  hcCost: number,
  isActive: boolean,
  title: string,
  description: string,
  iconUrl: string,
): Promise<AddSoftCurrencyProductResponse> => {
  try {
    /*
        let metadata = {
            title: title,
            description: description,
            iconUrl: iconUrl,
        };
        */
    const response = (await callShimAdmin(
      EndpointName.ADD_SOFT_CURRENCY_PRODUCT,
      {},
      {
        currencyId: currencyId,
        productSku: productSku,
        amount: amount,
        hcCost: hcCost,
        isActive: isActive,
        //metadata: metadata,
      },
    )) as AddSoftCurrencyProductResponse;
    return response;
  } catch (error) {
    console.error(`addSoftCurrencyProduct error: ${error.message}`);
    return null;
  }
};

export default addSoftCurrencyProduct;
