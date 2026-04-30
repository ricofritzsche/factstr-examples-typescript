import type { InteropEventRecord } from '@factstr/factstr-node';
import { SLOT_CANCELLED } from '../../events/slot_cancelled';
import { SLOT_RESERVED } from '../../events/slot_reserved';
import type { ReserveSlotResponse } from './response';

export type ReservationDecision =
  | {
      status: 'allow';
    }
  | ReserveSlotResponse;

export const decideReservation = (
  eventRecords: InteropEventRecord[],
): ReservationDecision => {
  const latestEvent = eventRecords.at(-1);

  if (!latestEvent) {
    return { status: 'allow' };
  }

  if (latestEvent.event_type === SLOT_CANCELLED) {
    return { status: 'allow' };
  }

  if (latestEvent.event_type === SLOT_RESERVED) {
    const payload =
      typeof latestEvent.payload === 'object' && latestEvent.payload !== null
        ? (latestEvent.payload as { user_name?: unknown })
        : {};

    const userName =
      typeof payload.user_name === 'string' && payload.user_name.length > 0
        ? payload.user_name
        : 'another user';

    return {
      status: 'rejection',
      reason: 'slot-already-reserved',
      message: `Slot already reserved by ${userName}.`,
    };
  }

  return { status: 'allow' };
};
