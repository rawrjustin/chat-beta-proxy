import { onError } from '@apollo/link-error';
import Logger from 'shared/logger';

const shouldCapture = (policy, { networkError, graphQLErrors }) => {
  if (!policy) return !!networkError || !!graphQLErrors;
  switch (policy) {
    case 'none':
      return false;
    case 'network-only':
      return !!networkError;
    case 'graphql-only':
      return !!graphQLErrors;
    default:
      return false;
  }
};

/**
 * Datadog link
 * Formats and sends errors to datadog.
 */
export const datadogLink = (ctx = {}) =>
  onError(({ operation, graphQLErrors, networkError }) => {
    const operationName = operation?.operationName;
    const context = operation.getContext();

    if (shouldCapture(context?.capturePolicy, { graphQLErrors })) {
      graphQLErrors.forEach((graphQLError) => {
        const statusCode = graphQLError?.extensions?.status_code;
        if (context.ignoreStatusCodes?.includes(statusCode)) return;
        if (
          graphQLError.message.includes('failed to get user profile') &&
          statusCode === 5
        )
          return;
        Logger.getInstance().error(
          `[GraphQL error] ${operationName}: ${graphQLError.message}${
            statusCode ? `, status_code: ${statusCode}` : ''
          }`,
          {
            ...ctx, // this will only log the json part of this field
            source: 'datadogLink : graphQLErrors',
            operationName,
            graphQLError, // this will only log the json part of this field
          },
        );
      });
    }

    if (shouldCapture(context?.capturePolicy, { networkError })) {
      Logger.getInstance().error(
        `[NetworkError] ${operationName}: ${networkError.message}`,
        {
          ...ctx, // this will only log the json part of this field
          source: 'datadogLink : networkError',
          operationName,
          networkError, // this will only log the json part of this field
        },
      );
    }
  });
