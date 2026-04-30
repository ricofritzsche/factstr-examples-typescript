const prefix = '[meeting-room-booking]';

export const log = {
  info(event: string, details?: Record<string, unknown>) {
    console.info(prefix, event, details ?? {});
  },
  warn(event: string, details?: Record<string, unknown>) {
    console.warn(prefix, event, details ?? {});
  },
  error(event: string, details?: Record<string, unknown>) {
    console.error(prefix, event, details ?? {});
  },
};
