import type { FactstrMemoryStore } from '@factstr/factstr-node';
import { SLOT_CANCELLED, type SlotCancelledEvent } from '../../events/slot_cancelled';
import { SLOT_RESERVED, type SlotReservedEvent } from '../../events/slot_reserved';
import { loadBoardFacts } from './load_board_facts';
import { projectBookingBoard } from './project_booking_board';
import type { GetBookingBoardRequest } from './request';

type BookingBoardEvent = SlotReservedEvent | SlotCancelledEvent;

const toBookingBoardEvent = (event: {
  event_type: typeof SLOT_RESERVED | typeof SLOT_CANCELLED;
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
  const events = result.event_records.map((event) =>
    toBookingBoardEvent({
      event_type: event.event_type as typeof SLOT_RESERVED | typeof SLOT_CANCELLED,
      payload: event.payload,
    }),
  );

  return projectBookingBoard(request, events);
};
