import type { EventRecord, FactstrMemoryStore } from '@factstr/factstr-node';
import { SLOT_CANCELLED, type SlotCancelledEvent } from '../../events/slot_cancelled';
import { SLOT_RESERVED, type SlotReservedEvent } from '../../events/slot_reserved';
import { loadBoardFacts } from './load_board_facts';
import { projectBoard } from './project_board';
import type { GetBookingBoardRequest } from './request';

type BookingBoardEvent = SlotReservedEvent | SlotCancelledEvent;

const isBookingBoardEventRecord = (event: EventRecord) =>
  event.event_type === SLOT_RESERVED || event.event_type === SLOT_CANCELLED;

const toBookingBoardEvent = (event: {
  event_type: string;
  payload: unknown;
}): BookingBoardEvent => {
  if (event.event_type === SLOT_RESERVED) {
    return {
      event_type: SLOT_RESERVED,
      payload: event.payload as SlotReservedEvent['payload'],
    };
  }

  return {
    event_type: SLOT_CANCELLED,
    payload: event.payload as SlotCancelledEvent['payload'],
  };
};

export const getBookingBoard = (
  store: FactstrMemoryStore,
  request: GetBookingBoardRequest,
) => {
  const result = loadBoardFacts(store, request);
  const events = result.event_records
    .filter(isBookingBoardEventRecord)
    .map(toBookingBoardEvent);
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
        `${roomId}::${request.date}::${slot}`,
        slotContext.current_context_version ?? null,
      );
    }
  }

  return projectBoard(request, events, slotContextVersions);
};
