import { describe, expect, it } from 'vitest';
import type { InteropEventRecord } from '@factstr/factstr-node';
import { SLOT_CANCELLED } from '../../src/events/slot_cancelled';
import { SLOT_RESERVED } from '../../src/events/slot_reserved';
import { decideReservation } from '../../src/features/reserve-slot/decide_reservation';

const record = (event_type: string, payload: unknown, sequence_number = 1n): InteropEventRecord => ({
  sequence_number,
  event_type,
  payload,
});

describe('decideReservation', () => {
  it('allows reservation when the slot is free', () => {
    expect(decideReservation([])).toEqual({ status: 'allow' });

    expect(
      decideReservation([
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
      ]),
    ).toEqual({ status: 'allow' });
  });

  it('rejects reservation when the slot is already reserved', () => {
    expect(
      decideReservation([
        record(SLOT_RESERVED, {
          room_id: 'Atlas',
          date: '2026-05-01',
          slot: '09:00',
          user_name: 'Nadia',
        }),
      ]),
    ).toEqual({
      status: 'rejection',
      reason: 'slot-already-reserved',
      message: 'Slot already reserved by Nadia.',
    });
  });
});
