import pino from "pino";
import pretty from "pino-pretty";
import { AbstractLogger } from "typeorm";

const stream = pretty({
  colorize: true, // color output
  levelFirst: false, // log level comes first
  // translateTime: 'SYS:standard',
});

const logger = pino(stream);

class PinoLogger extends AbstractLogger {
  logQuery(query, parameters, queryRunner) {
    logger.info(query);
  }

  logQueryError(error, query, parameters, queryRunner) {
    logger.error(error, query, parameters, "Query failed");
  }

  logQuerySlow(time, query, parameters, queryRunner) {
    logger.warn(time, query, parameters, "Slow query");
  }

  logMigration(message, queryRunner) {
    logger.info(message, "Migration");
  }

  log(level, message, queryRunner) {
    switch (level) {
      case "log":
        logger.info(message);
        break;
      case "info":
        logger.info(message);
        break;
      case "warn":
        logger.warn(message);
        break;
      default:
        logger.error(message);
        break;
    }
  }
}

export { PinoLogger, logger };
