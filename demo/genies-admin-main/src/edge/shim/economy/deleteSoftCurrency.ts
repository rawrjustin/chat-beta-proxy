import callShimAdmin, { EndpointName } from 'src/edge/shim/callShimAdmin';
import { DeleteSoftCurrencyResponse } from 'src/lib/swagger/admin';

/**
 * Deletes a soft currency by its ID
 * Uses the admin endpoint: /admin/economy/soft-currency/${currencyId}
 * The currencyId should be directly passed as a path parameter (not a query parameter)
 * The endpoint doesn't require party-id context as it's an admin endpoint
 */
const deleteSoftCurrency = async (
  currencyId: string,
): Promise<DeleteSoftCurrencyResponse> => {
  try {
    const response = (await callShimAdmin(EndpointName.DELETE_SOFT_CURRENCY, {
      currencyId,
    })) as DeleteSoftCurrencyResponse;

    return response || { message: 'No response from server' };
  } catch (error) {
    console.error(`deleteSoftCurrency error: ${error.message}`);
    throw error; // Propagate the error to be handled by the caller
  }
};

export default deleteSoftCurrency;
