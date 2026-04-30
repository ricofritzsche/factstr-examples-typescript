import type { FactstrMemoryStore } from '@factstr/factstr-node';
import { appendSlotReserved } from './append_slot_reserved';
import { buildSlotReserved } from './build_slot_reserved';
import { decideReservation } from './decide_reservation';
import { loadSlotContext } from './load_slot_context';
import type { ReserveSlotRequest } from './request';
import type { ReserveSlotResponse } from './response';

const parseExpectedContextVersion = (value: string | null) => {
  if (value === null) {
    return null;
  }

  return BigInt(value);
};

export const reserveSlot = (
  store: FactstrMemoryStore,
  request: ReserveSlotRequest,
): ReserveSlotResponse => {
  const slotContext = loadSlotContext(store, request);
  const decision = decideReservation(slotContext.result.event_records);

  if (decision.status !== 'allow') {
    return decision;
  }

  const event = buildSlotReserved(request);
  const appendResult = appendSlotReserved(
    store,
    event,
    slotContext.query,
    parseExpectedContextVersion(request.expected_context_version),
  );

  if (appendResult.conflict) {
    return {
      status: 'conflict',
      message: 'Slot changed underneath your view. Reload current state and try again.',
    };
  }

  return {
    status: 'success',
    message: `Reserved ${request.room_id} at ${request.slot} for ${request.user_name}.`,
  };
};
