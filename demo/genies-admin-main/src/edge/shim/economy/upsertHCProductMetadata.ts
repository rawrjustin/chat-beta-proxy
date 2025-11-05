import callShimAdmin, { EndpointName } from 'src/edge/shim/callShimAdmin';
import { UpsertHardCurrencyProductMetadataResponse } from 'src/lib/swagger/admin';

// hc = hard currency
const upsertHCProductMetadata = async (
  productSku: string,
  title: string,
  description: string,
  iconUrl: string,
): Promise<UpsertHardCurrencyProductMetadataResponse> => {
  try {
    const response = (await callShimAdmin(
      EndpointName.UPSERT_HC_PRODUCT_METADATA,
      {},
      {
        productSku: productSku,
        title: title,
        description: description,
        iconUrl: iconUrl,
      },
    )) as UpsertHardCurrencyProductMetadataResponse;
    return response;
  } catch (error) {
    console.error(`upsertHCProductMetadata error: ${error.message}`);
    return null;
  }
};

export default upsertHCProductMetadata;
