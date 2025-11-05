import { MILLISECONDS_PER_DAY } from 'shared/time';
import { setWithExpiry, getWithExpiry } from 'src/general/utils/localStorage';

const CLIENT_HASH_PREFIX = 'client';

export function getClientHashLocalStorageName(): string {
  return `${CLIENT_HASH_PREFIX}_${process.env.NEXT_PUBLIC_WEB_CLIENT_ID}`;
}

export const setClientHashLocalStorage = (value) => {
  const ttl = MILLISECONDS_PER_DAY;
  setWithExpiry(getClientHashLocalStorageName(), value, ttl);
};

export const getClientHashLocalStorage = () => {
  return getWithExpiry(getClientHashLocalStorageName());
};
