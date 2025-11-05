import callShimAdmin, { EndpointName } from 'src/edge/shim/callShimAdmin';
import {
  UpsertSoftCurrencyRequest,
  UpsertSoftCurrencyResponse,
} from 'src/lib/swagger/admin';

/**
 * Upserts (creates or updates) a soft currency
 * @param currencyId The ID of the currency (for updates) or a new ID (for creation)
 * @param currencyName The name of the currency
 * @param ownerId The ID of the owner (party/user) of the currency
 * @param ownerType The type of owner (e.g., "party")
 * @param currencyIconUrl Optional URL for the currency icon
 * @returns UpsertSoftCurrencyResponse with the result
 */
const upsertSoftCurrency = async (
  currencyId: string,
  currencyName: string,
  ownerId: string,
  ownerType: string = 'party',
  currencyIconUrl?: string,
): Promise<UpsertSoftCurrencyResponse> => {
  try {
    const normalizedOwnerType = ownerType.toLowerCase();

    const request: UpsertSoftCurrencyRequest = {
      currencyId,
      currencyName,
      ownerId,
      ownerType: normalizedOwnerType,
      currencyIconUrl,
    };

    const response = await callShimAdmin(
      EndpointName.UPSERT_SOFT_CURRENCY,
      {},
      request,
    );

    // Validate that the response has the expected structure
    if (!response) {
      throw new Error('No response received from callShimAdmin');
    }

    // Check if it's an error response (should be caught earlier, but just in case)
    if (
      response.message &&
      typeof response.message === 'string' &&
      !response.currencyId
    ) {
      throw new Error(`API error: ${response.message}`);
    }

    // Validate it has the required currencyId field
    if (!response.currencyId) {
      throw new Error(
        `Invalid response: missing currencyId. Full response: ${JSON.stringify(
          response,
        )}`,
      );
    }

    return response as UpsertSoftCurrencyResponse;
  } catch (error) {
    console.error(`upsertSoftCurrency error: ${error.message}`);
    throw error; // Re-throw the error instead of returning null
  }
};

export default upsertSoftCurrency;
