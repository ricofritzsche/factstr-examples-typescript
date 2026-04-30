import { SLOT_RESERVED, type SlotReservedEvent } from '../../events/slot_reserved';
import type { ReserveSlotRequest } from './request';

export const buildSlotReserved = (
  request: ReserveSlotRequest,
): SlotReservedEvent => {
  return {
    event_type: SLOT_RESERVED,
    payload: {
      room_id: request.room_id,
      date: request.date,
      slot: request.slot,
      user_name: request.user_name,
    },
  };
};
