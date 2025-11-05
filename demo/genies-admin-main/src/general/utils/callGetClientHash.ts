import axios from 'axios';
import Logger from 'shared/logger';

export async function callGetClientHash() {
  try {
    const res = await axios.get(
      `/api/client?clientId=${process.env.NEXT_PUBLIC_WEB_CLIENT_ID}`,
      null,
    );
    return res?.data?.hash;
  } catch (error) {
    Logger.getInstance().error(`callGetClientHash failed: ${error.message}`, {
      errorMessage: error.message,
      source: 'callGetClientHash',
    });
  }
  return false;
}
