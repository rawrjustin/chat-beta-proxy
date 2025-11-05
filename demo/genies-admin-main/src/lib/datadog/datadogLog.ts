import { datadogLogs } from '@datadog/browser-logs';

datadogLogs.init({
  clientToken: process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN,
  site: 'datadoghq.com',
  service: 'genies-admin',
  env: process.env.NEXT_PUBLIC_DATADOG_ENVIRONMENT,
  forwardErrorsToLogs: true,
  sampleRate: 100,
  beforeSend: (log) => {
    // disable send logger to datadog in local dev
    if (process.env.NEXT_PUBLIC_DATADOG_ENVIRONMENT === 'local') {
      console.log(log);
      return false;
    }
  },
});

export const logger = datadogLogs.logger;
