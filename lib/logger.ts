/**
 * Lightweight structured logging. Avoids console noise in production for debug-level messages.
 */
type LogLevel = "error" | "warn" | "info" | "debug";

const isDev = process.env.NODE_ENV === "development";

function emit(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  const payload = meta && Object.keys(meta).length > 0 ? { message, ...meta } : { message };
  const line = JSON.stringify({ level, time: new Date().toISOString(), ...payload });
  if (level === "error") {
    console.error(line);
    return;
  }
  if (level === "warn") {
    console.warn(line);
    return;
  }
  if (level === "info") {
    console.info(line);
    return;
  }
  if (isDev) {
    console.debug(line);
  }
}

export const logger = {
  error(message: string, meta?: Record<string, unknown>) {
    try {
      emit("error", message, meta);
    } catch {
      /* ignore logging failures */
    }
  },
  warn(message: string, meta?: Record<string, unknown>) {
    try {
      emit("warn", message, meta);
    } catch {
      /* ignore */
    }
  },
  info(message: string, meta?: Record<string, unknown>) {
    try {
      emit("info", message, meta);
    } catch {
      /* ignore */
    }
  },
  debug(message: string, meta?: Record<string, unknown>) {
    try {
      emit("debug", message, meta);
    } catch {
      /* ignore */
    }
  },
};
