import callShimAdmin, { EndpointName } from 'src/edge/shim/callShimAdmin';
import { GetAllCurrenciesForOwnerResponse } from 'src/lib/swagger/admin';

/**
 * Fetches all currencies for a given owner ID
 * Uses the admin endpoint: /admin/economy/soft-currency/${ownerId}
 * The ownerId should be directly passed as a path parameter (not a query parameter)
 * The endpoint doesn't require party-id context as it's an admin endpoint
 */
const getAllCurrenciesForOwner = async (
  ownerId: string,
  externalOwnerId?: string,
): Promise<GetAllCurrenciesForOwnerResponse> => {
  try {
    const response = (await callShimAdmin(
      EndpointName.GET_ALL_CURRENCIES_FOR_OWNER,
      { ownerId, externalOwnerId },
    )) as GetAllCurrenciesForOwnerResponse;

    return response || { currencies: [] };
  } catch (error) {
    console.error(`getAllCurrenciesForOwner error: ${error.message}`);
    return { currencies: [] };
  }
};

export default getAllCurrenciesForOwner;
