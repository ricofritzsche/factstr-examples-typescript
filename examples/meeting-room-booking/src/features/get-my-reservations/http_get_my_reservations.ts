import type { FactstrMemoryStore } from '@factstr/factstr-node';
import type { HttpResponse } from '../../app/http_types';
import { normalizeBoardDate } from '../../app/normalize_board_date';
import { runtimeLog } from '../../app/runtime_log';
import { getMyReservations } from './get_my_reservations';

export const httpGetMyReservations = (
  store: FactstrMemoryStore,
  requestUrl: URL,
  response: HttpResponse,
) => {
  const requestedDate = requestUrl.searchParams.get('date');
  const normalizedDate = normalizeBoardDate(requestedDate);
  const userName = requestUrl.searchParams.get('user_name') ?? '';

  if (requestedDate !== normalizedDate) {
    runtimeLog.warn('my-reservations-date-normalized', {
      requested_date: requestedDate,
      normalized_date: normalizedDate,
      user_name: userName,
    });
  }

  const result = getMyReservations(store, {
    date: normalizedDate,
    user_name: userName,
  });

  runtimeLog.info('my-reservations-requested', {
    route: '/__meeting-room-booking/my-reservations',
    date: normalizedDate,
    user_name: userName,
    reservation_count: result.reservations.length,
  });

  response.setHeader('content-type', 'application/json; charset=utf-8');
  response.end(JSON.stringify(result));
};
