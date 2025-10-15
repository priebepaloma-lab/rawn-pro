type LogLevel = "info" | "error" | "warn" | "debug";

type LogPayload = Record<string, unknown>;

type ConsoleMethod = (message?: unknown, ...optionalParams: unknown[]) => void;

const LOG_LEVEL_METHOD: Record<LogLevel, ConsoleMethod> = {
  info: console.log.bind(console),
  error: console.error.bind(console),
  warn: console.warn.bind(console),
  debug: console.debug.bind(console),
};

export function logEvent(
  event: string,
  payload: LogPayload = {},
  level: LogLevel = "info"
) {
  const logger = LOG_LEVEL_METHOD[level] ?? console.log;
  logger(
    JSON.stringify({
      level,
      event,
      timestamp: new Date().toISOString(),
      ...payload,
    })
  );
}
