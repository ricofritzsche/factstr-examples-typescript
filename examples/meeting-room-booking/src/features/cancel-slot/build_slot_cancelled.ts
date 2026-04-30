import { SLOT_CANCELLED, type SlotCancelledEvent } from '../../events/slot_cancelled';
import type { CancelSlotRequest } from './request';

export const buildSlotCancelled = (
  request: CancelSlotRequest,
): SlotCancelledEvent => {
  return {
    event_type: SLOT_CANCELLED,
    payload: {
      room_id: request.room_id,
      date: request.date,
      slot: request.slot,
      user_name: request.user_name,
    },
  };
};
