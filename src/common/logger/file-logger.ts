import { Injectable, Logger, Scope } from '@nestjs/common';
import { winstonLogger } from './winston-logger';

@Injectable({ scope: Scope.TRANSIENT })
export class FileLogger extends Logger {
  constructor(context: string) {
    super(context);
  }

  log(message: string) {
    super.log(message);
    winstonLogger.info(message);
  }

  error(message: string, trace: string, context?: string) {
    super.error(message, trace, context);
    winstonLogger.error(`${message} - ${trace}`);
  }

  warn(message: string) {
    super.warn(message);
    winstonLogger.warn(message);
  }

  debug(message: string) {
    super.debug(message);
    winstonLogger.debug(message);
  }

  verbose(message: string) {
    super.verbose(message);
    winstonLogger.verbose(message);
  }
}
