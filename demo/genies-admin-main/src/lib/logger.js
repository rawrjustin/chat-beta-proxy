const pino = require('pino');

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

const defaultPinoConf = {
  messageKey: 'message',
  base: null,
  prettyPrint: process.env.NODE_ENV === 'development',
  formatters: {
    level(label, number) {
      return {
        severity:
          PinoLevelToSeverityLookup[label] || PinoLevelToSeverityLookup['info'],
        level: number,
      };
    },
  },
};

const logger = pino(defaultPinoConf);

module.exports = logger;
