import type { FactstrMemoryStore } from '@factstr/factstr-node';
import type { HttpRequest, HttpResponse } from '../../app/http_types';
import { readJsonBody } from '../../app/read_json_body';
import { runtimeLog } from '../../app/runtime_log';
import { reserveSlot } from './reserve_slot';
import type { ReserveSlotRequest } from './request';
import { validateReserveRequest } from './validate_request';

export const httpPostReserveSlot = async (
  store: FactstrMemoryStore,
  request: HttpRequest,
  response: HttpResponse,
) => {
  const reserveRequest = await readJsonBody<ReserveSlotRequest>(request);
  const invalidRequest = validateReserveRequest(reserveRequest);

  if (invalidRequest) {
    runtimeLog.warn('reserve-slot-invalid-request', {
      room_id: reserveRequest.room_id,
      date: reserveRequest.date,
      slot: reserveRequest.slot,
      user_name: reserveRequest.user_name,
      message: invalidRequest.message,
    });
    response.statusCode = 400;
    response.setHeader('content-type', 'application/json; charset=utf-8');
    response.end(JSON.stringify(invalidRequest));
    return;
  }

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
};
