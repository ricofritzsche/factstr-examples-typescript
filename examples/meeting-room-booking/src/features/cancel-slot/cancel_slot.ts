import type { FactstrMemoryStore } from '@factstr/factstr-node';
import { appendSlotCancelled } from './append_slot_cancelled';
import { buildSlotCancelled } from './build_slot_cancelled';
import { decideCancellation } from './decide_cancellation';
import { loadSlotContext } from './load_slot_context';
import type { CancelSlotRequest } from './request';
import type { CancelSlotResponse } from './response';

const parseExpectedContextVersion = (value: string | null) => {
  if (value === null) {
    return null;
  }

  return BigInt(value);
};

export const cancelSlot = (
  store: FactstrMemoryStore,
  request: CancelSlotRequest,
): CancelSlotResponse => {
  const slotContext = loadSlotContext(store, request);
  const decision = decideCancellation(slotContext.result.event_records, request);

  if (decision.status !== 'allow') {
    return decision;
  }

  const event = buildSlotCancelled(request);
  const appendResult = appendSlotCancelled(
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
    message: `Cancelled ${request.room_id} at ${request.slot}.`,
  };
};
