import pino from 'pino';
import { logger as datadogLogger } from 'src/lib/datadog';

/**
 * Severity overrides are for StackDriver.
 * https://github.com/pinojs/pino/blob/master/docs/help.md#mapping-pino-log-levels-to-google-cloud-logging-stackdriver-serverity-levels
 */
const PinoLevelToSeverityLookup = {
  trace: 'DEBUG',
  debug: 'DEBUG',
  info: 'INFO',
  warn: 'WARNING',
  error: 'ERROR',
  fatal: 'CRITICAL',
};

/**
 * https://github.com/pinojs/pino/blob/master/docs/api.md#logmethod
 * Pino expects a binding object to be the first parameter with an optional string message as the second parameter.
 * But the datadog logger use the first parameter as message and second parameter as binding object.
 * Using this hook the parameters can be flipped.
 */
const hooks = {
  logMethod(inputArgs, method, level) {
    if (inputArgs.length >= 2) {
      const arg1 = inputArgs.shift();
      const arg2 = inputArgs.shift();
      return method.apply(this, [arg2, arg1, ...inputArgs]);
    }
    return method.apply(this, inputArgs);
  },
};

const defaultPinoConf = {
  messageKey: 'message',
  base: null,
  // only use pino-pretty for development, not production
  // https://npm.io/package/pino-pretty-js for CLI Arguments
  prettyPrint:
    process.env.NODE_ENV === 'development'
      ? { colorize: true, translateTime: 'SYS:standard' }
      : false,
  formatters: {
    level(label, number) {
      return {
        severity:
          PinoLevelToSeverityLookup[label] || PinoLevelToSeverityLookup['info'],
        level: number,
      };
    },
  },
  hooks,
};

// Pino logger
export const logger = pino(defaultPinoConf);

/**
 * The logger adapter to automatically choose the right logger for server and browser
 */
export default class Logger {
  private static instance;
  private constructor() {}
  public static getInstance() {
    if (!Logger.instance) {
      if (process.browser) Logger.instance = datadogLogger;
      else Logger.instance = logger;
    }
    return Logger.instance;
  }
}
