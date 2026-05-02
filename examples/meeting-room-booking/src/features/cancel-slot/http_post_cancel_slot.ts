import type { FactstrMemoryStore } from '@factstr/factstr-node';
import type { HttpRequest, HttpResponse } from '../../app/http_types';
import { readJsonBody } from '../../app/read_json_body';
import { runtimeLog } from '../../app/runtime_log';
import { cancelSlot } from './cancel_slot';
import type { CancelSlotRequest } from './request';

export const httpPostCancelSlot = async (
  store: FactstrMemoryStore,
  request: HttpRequest,
  response: HttpResponse,
) => {
  const cancelRequest = await readJsonBody<CancelSlotRequest>(request);
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
};
