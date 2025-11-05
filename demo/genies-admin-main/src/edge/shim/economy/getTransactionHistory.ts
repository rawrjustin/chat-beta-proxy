import callShimAdmin, { EndpointName } from 'src/edge/shim/callShimAdmin';
import { GetTransactionHistoryResponse } from 'src/lib/swagger/admin';

const getTransactionHistory = async (
  userId: string,
  page: number,
  page_size: number,
  store: string,
): Promise<GetTransactionHistoryResponse> => {
  try {
    const response = (await callShimAdmin(
      EndpointName.GET_TRANSACTION_HISTORY,
      { userId, page, page_size, store },
    )) as GetTransactionHistoryResponse;
    return response;
  } catch (error) {
    console.error(`getTransactionHistory error: ${error.message}`);
    return null;
  }
};

export default getTransactionHistory;
