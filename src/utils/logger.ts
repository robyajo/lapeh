import winston from "winston";
import "winston-daily-rotate-file";
import path from "path";
import fs from "fs";

const logDirectory = path.join(process.cwd(), "storage", "logs");

// Ensure log directory exists
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory, { recursive: true });
}

const dailyRotateFileTransport = new winston.transports.DailyRotateFile({
  filename: "lapeh-%DATE%.log",
  dirname: logDirectory,
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "20m",
  maxFiles: "3d",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf((info: any) => {
      let log = `[${info.timestamp}] ${info.level.toUpperCase()}: ${
        info.message
      }`;

      // Handle metadata (errors, etc)
      const { timestamp, level, message, service, ...meta } = info;
      if (Object.keys(meta).length > 0) {
        // If meta has 'errors', nicely format it
        if (meta.errors) {
          log += `\nErrors: ${JSON.stringify(meta.errors, null, 2)}`;
          delete meta.errors;
        }
        // If there are other meta properties remaining, log them
        if (Object.keys(meta).length > 0 && !meta.stack && !meta.error) {
          log += `\nMeta: ${JSON.stringify(meta)}`;
        }
      }

      if (info.stack) {
        log += `\n${info.stack}`;
      } else if (info.error && info.error.stack) {
        log += `\n${info.error.stack}`;
      }
      return log;
    })
  ),
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: "lapeh-service" },
  transports: [
    // Write all logs with importance level of `error` or less to `error.log`
    // new winston.transports.File({ filename: 'error.log', level: 'error' }),
    // Write all logs to `combined.log`
    // new winston.transports.File({ filename: 'combined.log' }),
    dailyRotateFileTransport,
  ],
});

// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}

export class Log {
  static info(message: string, meta?: any) {
    logger.info(message, meta);
  }

  static error(message: string, meta?: any) {
    logger.error(message, meta);
  }

  static warn(message: string, meta?: any) {
    logger.warn(message, meta);
  }

  static debug(message: string, meta?: any) {
    logger.debug(message, meta);
  }
}

export default logger;
