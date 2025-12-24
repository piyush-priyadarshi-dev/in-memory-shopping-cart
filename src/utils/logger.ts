type LogLevel = "info" | "error";

// Lightweight console logger to keep output consistent.
const formatMessage = (
  level: LogLevel,
  message: string,
  meta?: Record<string, unknown>
) => {
  const time = new Date().toISOString();
  const metaJson = meta ? ` ${JSON.stringify(meta)}` : "";
  return `[${time}] [${level.toUpperCase()}] ${message}${metaJson}`;
};

export const logger = {
  info(message: string, meta?: Record<string, unknown>) {
    console.log(formatMessage("info", message, meta));
  },
  error(message: string, meta?: Record<string, unknown>) {
    console.error(formatMessage("error", message, meta));
  },
};
