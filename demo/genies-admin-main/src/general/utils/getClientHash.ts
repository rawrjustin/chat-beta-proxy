import Logger from 'shared/logger';
import { callGetClientHash } from './callGetClientHash';
import {
  getClientHashLocalStorage,
  setClientHashLocalStorage,
} from './clientHashLocalStorage';

export const getClientHash = async () => {
  const currentClientHash = getClientHashLocalStorage();
  if (currentClientHash) {
    return currentClientHash;
  }
  try {
    const clientHash = await callGetClientHash();
    if (clientHash) {
      setClientHashLocalStorage(clientHash);
    }
    return clientHash;
  } catch (e) {
    Logger.getInstance().error(`get client hash error: ${e}`, {
      errorMessage: e?.message,
      source: 'app',
    });
    return null;
  }
};
