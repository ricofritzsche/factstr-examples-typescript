import type { FactstrMemoryStore } from '@factstr/factstr-node';
import { SLOT_CANCELLED } from '../../events/slot_cancelled';
import { SLOT_RESERVED } from '../../events/slot_reserved';
import type { GetBookingBoardRequest } from './request';

const createSlotKey = (roomId: string, date: string, slot: string) =>
  `${roomId}::${date}::${slot}`;

export const loadSlotContextVersions = (
  store: FactstrMemoryStore,
  request: GetBookingBoardRequest,
) => {
  const slotContextVersions = new Map<string, bigint | null>();

  for (const roomId of request.room_ids) {
    for (const slot of request.slots) {
      const slotContext = store.query({
        filters: [
          {
            event_types: [SLOT_RESERVED, SLOT_CANCELLED],
            payload_predicates: [
              {
                room_id: roomId,
                date: request.date,
                slot,
              },
            ],
          },
        ],
      });

      slotContextVersions.set(
        createSlotKey(roomId, request.date, slot),
        slotContext.current_context_version ?? null,
      );
    }
  }

  return slotContextVersions;
};
