import type { FactstrMemoryStore } from '@factstr/factstr-node';
import { boardRoomIds, boardSlots } from '../../app/board_defaults';
import type { HttpResponse } from '../../app/http_types';
import { normalizeBoardDate } from '../../app/normalize_board_date';
import { runtimeLog } from '../../app/runtime_log';
import { getBookingBoard } from './get_booking_board';

export const httpGetBookingBoard = (
  store: FactstrMemoryStore,
  requestUrl: URL,
  response: HttpResponse,
) => {
  const requestedDate = requestUrl.searchParams.get('date');
  const normalizedDate = normalizeBoardDate(requestedDate);

  if (requestedDate !== normalizedDate) {
    runtimeLog.warn('board-date-normalized', {
      requested_date: requestedDate,
      normalized_date: normalizedDate,
    });
  }

  const result = getBookingBoard(store, {
    date: normalizedDate,
    room_ids: [...boardRoomIds],
    slots: [...boardSlots],
  });

  runtimeLog.info('board-requested', {
    route: '/__meeting-room-booking/board',
    date: normalizedDate,
  });

  response.setHeader('content-type', 'application/json; charset=utf-8');
  response.end(JSON.stringify(result));
};
