import type { FactstrMemoryStore } from '@factstr/factstr-node';
import { httpGetRecentEvents } from './http_get_recent_events';
import { httpGetBookingBoard } from '../features/booking-board/http_get_booking_board';
import { httpGetMyReservations } from '../features/get-my-reservations/http_get_my_reservations';
import { httpPostReserveSlot } from '../features/reserve-slot/http_post_reserve_slot';
import { httpPostCancelSlot } from '../features/cancel-slot/http_post_cancel_slot';
import type { HttpRequest, HttpResponse } from './http_types';

const routeBase = '/__meeting-room-booking';
const boardPath = `${routeBase}/board`;
const cancelPath = `${routeBase}/cancel`;
const eventsPath = `${routeBase}/events`;
const myReservationsPath = `${routeBase}/my-reservations`;
const reservePath = `${routeBase}/reserve`;

export const httpApp = async (
  store: FactstrMemoryStore,
  request: HttpRequest,
  response: HttpResponse,
) => {
  const method = request.method ?? 'GET';
  const requestUrl = new URL(request.url ?? '/', 'http://localhost');
  const pathname = requestUrl.pathname;

  if (method === 'GET' && pathname === boardPath) {
    httpGetBookingBoard(store, requestUrl, response);
    return true;
  }

  if (method === 'GET' && pathname === myReservationsPath) {
    httpGetMyReservations(store, requestUrl, response);
    return true;
  }

  if (method === 'GET' && pathname === eventsPath) {
    httpGetRecentEvents(store, response);
    return true;
  }

  if (method === 'POST' && pathname === reservePath) {
    await httpPostReserveSlot(store, request, response);
    return true;
  }

  if (method === 'POST' && pathname === cancelPath) {
    await httpPostCancelSlot(store, request, response);
    return true;
  }

  return false;
};
