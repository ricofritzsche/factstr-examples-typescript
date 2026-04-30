import type { InteropEventRecord } from '@factstr/factstr-node';
import { SLOT_CANCELLED } from '../../events/slot_cancelled';
import { SLOT_RESERVED } from '../../events/slot_reserved';
import type { CancelSlotRequest } from './request';
import type { CancelSlotResponse } from './response';

export type CancellationDecision =
  | {
      status: 'allow';
    }
  | CancelSlotResponse;

export const decideCancellation = (
  eventRecords: InteropEventRecord[],
  request: CancelSlotRequest,
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
    const payload =
      typeof latestEvent.payload === 'object' && latestEvent.payload !== null
        ? (latestEvent.payload as { user_name?: unknown })
        : {};

    if (payload.user_name === request.user_name) {
      return { status: 'allow' };
    }

    const owner =
      typeof payload.user_name === 'string' && payload.user_name.length > 0
        ? payload.user_name
        : 'another user';

    return {
      status: 'rejection',
      reason: 'slot-owned-by-another-user',
      message: `Slot is reserved by ${owner}. Only the matching reserver can cancel it.`,
    };
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
