import createLogger from "pino";

export const logger = createLogger({
  level: process.env.LOG_LEVEL || "info",
});
