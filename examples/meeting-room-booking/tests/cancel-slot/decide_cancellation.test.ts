import { describe, expect, it } from 'vitest';
import type { InteropEventRecord } from '@factstr/factstr-node';
import { SLOT_CANCELLED } from '../../src/events/slot_cancelled';
import { SLOT_RESERVED } from '../../src/events/slot_reserved';
import { decideCancellation } from '../../src/features/cancel-slot/decide_cancellation';

const record = (event_type: string, payload: unknown, sequence_number = 1n): InteropEventRecord => ({
  sequence_number,
  event_type,
  payload,
});

describe('decideCancellation', () => {
  it('allows cancellation when the slot is reserved by the matching user', () => {
    expect(
      decideCancellation([
        record(SLOT_RESERVED, {
          room_id: 'Atlas',
          date: '2026-05-01',
          slot: '09:00',
          user_name: 'Nadia',
        }),
      ], {
        room_id: 'Atlas',
        date: '2026-05-01',
        slot: '09:00',
        user_name: 'Nadia',
        expected_context_version: '1',
      }),
    ).toEqual({ status: 'allow' });
  });

  it('rejects cancellation when the slot is free', () => {
    expect(decideCancellation([], {
      room_id: 'Atlas',
      date: '2026-05-01',
      slot: '09:00',
      user_name: 'Alex',
      expected_context_version: null,
    })).toEqual({
      status: 'rejection',
      reason: 'slot-already-free',
      message: 'Slot is already free.',
    });

    expect(
      decideCancellation([
        record(SLOT_RESERVED, {
          room_id: 'Atlas',
          date: '2026-05-01',
          slot: '09:00',
          user_name: 'Nadia',
        }),
        record(
          SLOT_CANCELLED,
          {
            room_id: 'Atlas',
            date: '2026-05-01',
            slot: '09:00',
            user_name: 'Nadia',
          },
          2n,
        ),
      ], {
        room_id: 'Atlas',
        date: '2026-05-01',
        slot: '09:00',
        user_name: 'Alex',
        expected_context_version: '2',
      }),
    ).toEqual({
      status: 'rejection',
      reason: 'slot-already-free',
      message: 'Slot is already free.',
    });
  });

  it('rejects cancellation when another user owns the reservation', () => {
    expect(
      decideCancellation([
        record(SLOT_RESERVED, {
          room_id: 'Atlas',
          date: '2026-05-01',
          slot: '09:00',
          user_name: 'Nadia',
        }),
      ], {
        room_id: 'Atlas',
        date: '2026-05-01',
        slot: '09:00',
        user_name: 'Alex',
        expected_context_version: '1',
      }),
    ).toEqual({
      status: 'rejection',
      reason: 'slot-owned-by-another-user',
      message: 'Slot is reserved by Nadia. Only the matching reserver can cancel it.',
    });
  });
});
