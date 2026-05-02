const prefix = '[meeting-room-booking runtime]';

export const runtimeLog = {
  info(event: string, details?: Record<string, unknown>) {
    console.log(prefix, event, details ?? {});
  },
  warn(event: string, details?: Record<string, unknown>) {
    console.warn(prefix, event, details ?? {});
  },
  error(event: string, details?: Record<string, unknown>) {
    console.error(prefix, event, details ?? {});
  },
};
