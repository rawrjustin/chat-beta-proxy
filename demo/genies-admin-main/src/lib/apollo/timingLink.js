import { ApolloLink } from '@apollo/client';

export const niceElapsedTime = (ms) => {
  const seconds = ms / 1000;
  if (seconds >= 3) {
    return `${Math.round(seconds)}s`;
  } else if (seconds >= 1) {
    return `${Number(seconds).toFixed(2)}s`;
  }
  return `${ms}ms`;
};

export const niceLog = (record, { origin }) => {
  if (process.browser) {
    console.log(
      `%cQuery: %c${record[0]} - ${record[1]} %cOrigin: %c${origin}`,
      'color:#0074D9;font-weight:bold;',
      'color:unset',
      'color:#0074D9;font-weight:bold;',
      'color:unset',
    );
  } else {
    console.log(`Query: ${record[0]} - ${record[1]} Origin: ${origin}`);
  }
};

export const createTimingLink = () => {
  const store = [];
  const link = new ApolloLink((operation, forward) => {
    const startTime = Date.now();
    return forward(operation).map((result) => {
      const elapsed = Date.now() - startTime;
      const record = [operation.operationName, niceElapsedTime(elapsed)];
      niceLog(record, operation.getContext());
      store.push(record);
      return result;
    });
  });
  link.timings = store;
  return { timingLink: link, timingCache: store };
};
