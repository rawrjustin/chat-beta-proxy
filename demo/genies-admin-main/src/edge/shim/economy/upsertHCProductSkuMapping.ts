import callShimAdmin, { EndpointName } from 'src/edge/shim/callShimAdmin';
import { UpsertProductSkuMappingResponse } from 'src/lib/swagger/admin';

// hc = hard currency
const upsertHCProductSkuMapping = async (
  partyId: string,
  storeId: number,
  productId: string,
  productSku: string,
): Promise<UpsertProductSkuMappingResponse> => {
  try {
    const response = (await callShimAdmin(
      EndpointName.UPSERT_HC_PRODUCT_SKU_MAPPING,
      {},
      {
        partyId: partyId,
        storeId: storeId,
        productId: productId,
        productSku: productSku,
      },
    )) as UpsertProductSkuMappingResponse;
    return response;
  } catch (error) {
    console.error(`upsertHCProductSkuMapping error: ${error.message}`);
    return null;
  }
};

export default upsertHCProductSkuMapping;
