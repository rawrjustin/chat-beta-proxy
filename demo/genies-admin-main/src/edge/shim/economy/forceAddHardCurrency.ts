import callShimAdmin, { EndpointName } from 'src/edge/shim/callShimAdmin';
import { ForceAddHardCurrencyResponse } from 'src/lib/swagger/admin';

const forceAddHardCurrency = async (
  userId: string,
  amt: number,
  walletType: string,
): Promise<ForceAddHardCurrencyResponse> => {
  try {
    const response = (await callShimAdmin(
      EndpointName.FORCE_ADD_HARD_CURRENCY,
      { userId },
      {
        amount: amt,
        walletType: walletType,
      },
    )) as ForceAddHardCurrencyResponse;
    return response;
  } catch (error) {
    console.error(`forceAddHardCurrency error: ${error.message}`);
    return null;
  }
};

export default forceAddHardCurrency;
