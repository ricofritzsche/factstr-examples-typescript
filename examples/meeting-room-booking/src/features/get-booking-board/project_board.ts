import { SLOT_CANCELLED, type SlotCancelledEvent } from '../../events/slot_cancelled';
import { SLOT_RESERVED, type SlotReservedEvent } from '../../events/slot_reserved';
import type { GetBookingBoardRequest } from './request';
import type { BookingBoardResponse } from './response';

type BookingBoardEvent = SlotReservedEvent | SlotCancelledEvent;

type SlotState = {
  status: 'free' | 'reserved';
  user_name: string | null;
};

const createSlotState = (): SlotState => ({
  status: 'free',
  user_name: null,
});

const createSlotKey = (roomId: string, date: string, slot: string) =>
  `${roomId}::${date}::${slot}`;

export const projectBoard = (
  request: GetBookingBoardRequest,
  events: BookingBoardEvent[],
): BookingBoardResponse => {
  const relevantRooms = new Set(request.room_ids);
  const relevantSlots = new Set(request.slots);
  const slotStates = new Map<string, SlotState>();

  for (const event of events) {
    const { room_id, date, slot } = event.payload;

    if (date !== request.date) {
      continue;
    }

    if (!relevantRooms.has(room_id) || !relevantSlots.has(slot)) {
      continue;
    }

    const slotKey = createSlotKey(room_id, date, slot);

    if (event.event_type === SLOT_RESERVED) {
      slotStates.set(slotKey, {
        status: 'reserved',
        user_name: event.payload.user_name,
      });
      continue;
    }

    if (event.event_type === SLOT_CANCELLED) {
      slotStates.set(slotKey, createSlotState());
    }
  }

  return {
    date: request.date,
    rooms: request.room_ids.map((room_id) => ({
      room_id,
      slots: request.slots.map((slot) => {
        const slotState =
          slotStates.get(createSlotKey(room_id, request.date, slot)) ?? createSlotState();

        return {
          slot,
          status: slotState.status,
          user_name: slotState.user_name,
        };
      }),
    })),
  };
};
