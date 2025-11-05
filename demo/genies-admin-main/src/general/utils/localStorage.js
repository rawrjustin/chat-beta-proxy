export const getItem = (key) => {
  let item;
  try {
    item = window.localStorage.getItem(key);
    return item === null ? null : JSON.parse(item);
  } catch (_) {
    return null;
  }
};

export const setItem = (key, value) => {
  if (typeof value === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (_) {
    return;
  }
};

export const removeItem = (key) => {
  try {
    window.localStorage.removeItem(key);
  } catch (_) {
    return;
  }
};

// TTL (Time to live) value is in milliseconds
export const setWithExpiry = (key, value, ttl) => {
  // `item` is an object which contains the original value
  // as well as the time when it's supposed to expire
  const item = {
    value: value,
    expiry: Date.now() + ttl,
  };
  setItem(key, JSON.stringify(item));
};

export const getWithExpiry = (key) => {
  const itemStr = getItem(key);
  // if the item doesn't exist, return null
  if (!itemStr) {
    return null;
  }
  try {
    const item = JSON.parse(itemStr);
    // compare the expiry time of the item with the current time
    if (Date.now() > item.expiry) {
      // If the item is expired, delete the item from storage and return null
      removeItem(key);
      return null;
    }
    return item.value;
  } catch (_) {
    return null;
  }
};
