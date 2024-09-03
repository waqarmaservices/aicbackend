import { LoggerOptions, transports, createLogger, format } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const logDir = 'logs';
const logFilePath = `${logDir}/app-%DATE%.log`;

const options: LoggerOptions = {
  format: format.combine(
    format.timestamp(),
    format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level}] ${message}`;
    }),
  ),
  transports: [
    new DailyRotateFile({
      filename: logFilePath,
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
    }),
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    }),
  ],
};

export const winstonLogger = createLogger(options);
