import { SLOT_CANCELLED, type SlotCancelledEvent } from '../../events/slot_cancelled';
import { SLOT_RESERVED, type SlotReservedEvent } from '../../events/slot_reserved';
import type { GetMyReservationsRequest } from './request';
import type { GetMyReservationsResponse, MyReservationView } from './response';

type MyReservationsEvent = SlotReservedEvent | SlotCancelledEvent;

const createReservationKey = (roomId: string, slot: string) => `${roomId}::${slot}`;

export const projectMyReservations = (
  request: GetMyReservationsRequest,
  events: MyReservationsEvent[],
): GetMyReservationsResponse => {
  const activeReservations = new Map<string, MyReservationView>();

  for (const event of events) {
    const { room_id, date, slot, user_name } = event.payload;

    if (date !== request.date || user_name !== request.user_name) {
      continue;
    }

    const reservationKey = createReservationKey(room_id, slot);

    if (event.event_type === SLOT_RESERVED) {
      activeReservations.set(reservationKey, {
        room_id,
        slot,
      });
      continue;
    }

    if (event.event_type === SLOT_CANCELLED) {
      activeReservations.delete(reservationKey);
    }
  }

  return {
    date: request.date,
    user_name: request.user_name,
    reservations: [...activeReservations.values()].sort((left, right) => {
      if (left.room_id === right.room_id) {
        return left.slot.localeCompare(right.slot);
      }

      return left.room_id.localeCompare(right.room_id);
    }),
  };
};
