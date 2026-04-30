import { defineConfig } from 'vite';
import type { Connect, PreviewServer, ViteDevServer } from 'vite';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { boardRoomIds, boardSlots, defaultBoardDate } from './src/app/board_defaults';
import { createStore } from './src/app/create_store';
import { cancelSlot } from './src/features/cancel-slot/cancel_slot';
import type { CancelSlotRequest } from './src/features/cancel-slot/request';
import { getBookingBoard } from './src/features/booking-board/get_booking_board';
import { reserveSlot } from './src/features/reserve-slot/reserve_slot';
import type { ReserveSlotRequest } from './src/features/reserve-slot/request';

const routeBase = '/__meeting-room-booking';
const boardPath = `${routeBase}/board`;
const cancelPath = `${routeBase}/cancel`;
const reservePath = `${routeBase}/reserve`;
const store = createStore();

const runtimeLog = {
  info(event: string, details?: Record<string, unknown>) {
    console.log('[meeting-room-booking runtime]', event, details ?? {});
  },
  warn(event: string, details?: Record<string, unknown>) {
    console.warn('[meeting-room-booking runtime]', event, details ?? {});
  },
  error(event: string, details?: Record<string, unknown>) {
    console.error('[meeting-room-booking runtime]', event, details ?? {});
  },
};

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

const normalizeBoardDate = (value: string | null) => {
  if (!value || !datePattern.test(value)) {
    return defaultBoardDate;
  }

  const parsed = new Date(`${value}T00:00:00Z`);

  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
    return defaultBoardDate;
  }

  return value;
};

const getBoard = (date: string) => {
  return getBookingBoard(store, {
    date,
    room_ids: [...boardRoomIds],
    slots: [...boardSlots],
  });
};

const readJsonBody = async (request: IncomingMessage) => {
  const chunks: Buffer[] = [];

  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  return JSON.parse(Buffer.concat(chunks).toString('utf8')) as
    | ReserveSlotRequest
    | CancelSlotRequest;
};

const handleRuntimeRequest = async (
  request: IncomingMessage,
  response: ServerResponse,
) => {
  const method = request.method ?? 'GET';
  const requestUrl = new URL(request.url ?? '/', 'http://localhost');
  const pathname = requestUrl.pathname;

  if (method === 'GET' && pathname === boardPath) {
    const requestedDate = requestUrl.searchParams.get('date');
    const normalizedDate = normalizeBoardDate(requestedDate);

    if (requestedDate !== normalizedDate) {
      runtimeLog.warn('board-date-normalized', {
        requested_date: requestedDate,
        normalized_date: normalizedDate,
      });
    }

    runtimeLog.info('board-requested', { route: boardPath, date: normalizedDate });
    response.setHeader('content-type', 'application/json; charset=utf-8');
    response.end(JSON.stringify(getBoard(normalizedDate)));
    return true;
  }

  if (method === 'POST' && pathname === reservePath) {
    const reserveRequest = (await readJsonBody(request)) as ReserveSlotRequest;
    const result = reserveSlot(store, reserveRequest);

    if (result.status === 'success') {
      runtimeLog.info('reserve-slot-success', {
        acting_user: reserveRequest.user_name,
        room_id: reserveRequest.room_id,
        date: reserveRequest.date,
        slot: reserveRequest.slot,
        user_name: reserveRequest.user_name,
      });
    } else if (result.status === 'conflict') {
      runtimeLog.warn('reserve-slot-conflict', {
        acting_user: reserveRequest.user_name,
        room_id: reserveRequest.room_id,
        date: reserveRequest.date,
        slot: reserveRequest.slot,
        user_name: reserveRequest.user_name,
        expected_context_version: reserveRequest.expected_context_version,
      });
    } else {
      runtimeLog.warn('reserve-slot-rejection', {
        acting_user: reserveRequest.user_name,
        room_id: reserveRequest.room_id,
        date: reserveRequest.date,
        slot: reserveRequest.slot,
        user_name: reserveRequest.user_name,
        reason: result.reason,
      });
    }

    response.setHeader('content-type', 'application/json; charset=utf-8');
    response.end(JSON.stringify(result));
    return true;
  }

  if (method === 'POST' && pathname === cancelPath) {
    const cancelRequest = (await readJsonBody(request)) as CancelSlotRequest;
    const result = cancelSlot(store, cancelRequest);

    if (result.status === 'success') {
      runtimeLog.info('cancel-slot-success', {
        acting_user: cancelRequest.user_name,
        room_id: cancelRequest.room_id,
        date: cancelRequest.date,
        slot: cancelRequest.slot,
        user_name: cancelRequest.user_name,
      });
    } else if (result.status === 'conflict') {
      runtimeLog.warn('cancel-slot-conflict', {
        acting_user: cancelRequest.user_name,
        room_id: cancelRequest.room_id,
        date: cancelRequest.date,
        slot: cancelRequest.slot,
        user_name: cancelRequest.user_name,
        expected_context_version: cancelRequest.expected_context_version,
      });
    } else {
      runtimeLog.warn('cancel-slot-rejection', {
        acting_user: cancelRequest.user_name,
        room_id: cancelRequest.room_id,
        date: cancelRequest.date,
        slot: cancelRequest.slot,
        user_name: cancelRequest.user_name,
        reason: result.reason,
      });
    }

    response.setHeader('content-type', 'application/json; charset=utf-8');
    response.end(JSON.stringify(result));
    return true;
  }

  return false;
};

const createRuntimeMiddleware = () => {
  return async (
    request: IncomingMessage,
    response: ServerResponse,
    next: Connect.NextFunction,
  ) => {
    const handled = await handleRuntimeRequest(request, response);

    if (!handled) {
      next();
    }
  };
};

export default defineConfig({
  plugins: [
    {
      name: 'meeting-room-booking-runtime',
      configureServer(server: ViteDevServer) {
        server.middlewares.use(createRuntimeMiddleware());
      },
      configurePreviewServer(server: PreviewServer) {
        server.middlewares.use(createRuntimeMiddleware());
      },
    },
  ],
});
