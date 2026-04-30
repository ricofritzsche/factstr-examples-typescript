import type { InteropEventRecord } from '@factstr/factstr-node';
import { SLOT_CANCELLED } from '../../events/slot_cancelled';
import { SLOT_RESERVED } from '../../events/slot_reserved';
import type { CancelSlotResponse } from './response';

export type CancellationDecision =
  | {
      status: 'allow';
    }
  | CancelSlotResponse;

export const decideCancellation = (
  eventRecords: InteropEventRecord[],
): CancellationDecision => {
  const latestEvent = eventRecords.at(-1);

  if (!latestEvent) {
    return {
      status: 'rejection',
      reason: 'slot-already-free',
      message: 'Slot is already free.',
    };
  }

  if (latestEvent.event_type === SLOT_RESERVED) {
    return { status: 'allow' };
  }

  if (latestEvent.event_type === SLOT_CANCELLED) {
    return {
      status: 'rejection',
      reason: 'slot-already-free',
      message: 'Slot is already free.',
    };
  }

  return {
    status: 'rejection',
    reason: 'slot-already-free',
    message: 'Slot is already free.',
  };
};
