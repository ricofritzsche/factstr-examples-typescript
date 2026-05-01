import type { EventRecord, FactstrMemoryStore } from '@factstr/factstr-node';
import { SLOT_CANCELLED, type SlotCancelledEvent } from '../../events/slot_cancelled';
import { SLOT_RESERVED, type SlotReservedEvent } from '../../events/slot_reserved';
import { loadUserDayFacts } from './load_user_day_facts';
import { projectMyReservations } from './project_my_reservations';
import type { GetMyReservationsRequest } from './request';

type MyReservationsEvent = SlotReservedEvent | SlotCancelledEvent;

const isMyReservationsEventRecord = (event: EventRecord) =>
  event.event_type === SLOT_RESERVED || event.event_type === SLOT_CANCELLED;

const toMyReservationsEvent = (event: {
  event_type: string;
  payload: unknown;
}): MyReservationsEvent => {
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

export const getMyReservations = (
  store: FactstrMemoryStore,
  request: GetMyReservationsRequest,
) => {
  const result = loadUserDayFacts(store, request);
  const events = result.event_records.filter(isMyReservationsEventRecord).map(toMyReservationsEvent);

  return projectMyReservations(request, events);
};
