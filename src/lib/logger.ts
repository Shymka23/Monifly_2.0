type LogLevel = "info" | "warn" | "error";

class Logger {
  private isDevelopment = process.env.NODE_ENV === "development";

  private log(level: LogLevel, message: string, ...args: unknown[]) {
    if (this.isDevelopment) {
      switch (level) {
        case "info":
          // eslint-disable-next-line no-console
          console.log(`[INFO] ${message}`, ...args);
          break;
        case "warn":
          // eslint-disable-next-line no-console
          console.warn(`[WARN] ${message}`, ...args);
          break;
        case "error":
          // eslint-disable-next-line no-console
          console.error(`[ERROR] ${message}`, ...args);
          break;
      }
    }
  }

  info(message: string, ...args: unknown[]) {
    this.log("info", message, ...args);
  }

  warn(message: string, ...args: unknown[]) {
    this.log("warn", message, ...args);
  }

  error(message: string, ...args: unknown[]) {
    this.log("error", message, ...args);
  }
}

export const logger = new Logger();
