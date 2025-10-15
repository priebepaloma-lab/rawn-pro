export type LoggerLevel = "info" | "warn" | "error" | "debug";

const prefix = "[RAWN-PRO]";

export function clientLog(
  level: LoggerLevel,
  message: string,
  payload?: Record<string, unknown>
) {
  const body = {
    level,
    message,
    ...payload,
    ts: new Date().toISOString(),
  };

  const formatted = `${prefix} ${message}`;

  switch (level) {
    case "error":
      console.error(formatted, body);
      break;
    case "warn":
      console.warn(formatted, body);
      break;
    case "debug":
      console.debug(formatted, body);
      break;
    default:
      console.log(formatted, body);
  }
}

export function clientInfo(message: string, payload?: Record<string, unknown>) {
  clientLog("info", message, payload);
}

export function clientWarn(message: string, payload?: Record<string, unknown>) {
  clientLog("warn", message, payload);
}

export function clientError(
  message: string,
  payload?: Record<string, unknown>
) {
  clientLog("error", message, payload);
}
