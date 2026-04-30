import { describe, expect, it } from 'vitest';
import factstrNode from '@factstr/factstr-node';
import { SLOT_CANCELLED } from '../../src/events/slot_cancelled';
import { SLOT_RESERVED } from '../../src/events/slot_reserved';
import { reserveSlot } from '../../src/features/reserve-slot/reserve_slot';

const { FactstrMemoryStore } = factstrNode;

describe('reserveSlot', () => {
  it('appends a reservation event on success', () => {
    const store = new FactstrMemoryStore();

    const result = reserveSlot(store, {
      room_id: 'Atlas',
      date: '2026-05-01',
      slot: '09:00',
      user_name: 'Alex',
      expected_context_version: null,
    });

    expect(result).toEqual({
      status: 'success',
      message: 'Reserved Atlas at 09:00 for Alex.',
    });

    expect(
      store.query({
        filters: [
          {
            event_types: [SLOT_RESERVED],
            payload_predicates: [{ room_id: 'Atlas', date: '2026-05-01', slot: '09:00' }],
          },
        ],
      }).event_records,
    ).toHaveLength(1);
  });

  it('returns explicit rejection before append when already reserved', () => {
    const store = new FactstrMemoryStore();
    store.append([
      {
        event_type: SLOT_RESERVED,
        payload: {
          room_id: 'Atlas',
          date: '2026-05-01',
          slot: '09:00',
          user_name: 'Nadia',
        },
      },
    ]);

    const before = store.query({ filters: [{ event_types: [SLOT_RESERVED, SLOT_CANCELLED] }] })
      .event_records.length;

    const result = reserveSlot(store, {
      room_id: 'Atlas',
      date: '2026-05-01',
      slot: '09:00',
      user_name: 'Alex',
      expected_context_version: '1',
    });

    const after = store.query({ filters: [{ event_types: [SLOT_RESERVED, SLOT_CANCELLED] }] })
      .event_records.length;

    expect(result).toEqual({
      status: 'rejection',
      reason: 'slot-already-reserved',
      message: 'Slot already reserved by Nadia.',
    });
    expect(after).toBe(before);
  });

  it('returns explicit conflict when expected context version is stale', () => {
    const store = new FactstrMemoryStore();

    store.append([
      {
        event_type: SLOT_RESERVED,
        payload: {
          room_id: 'Atlas',
          date: '2026-05-01',
          slot: '09:00',
          user_name: 'Nadia',
        },
      },
      {
        event_type: SLOT_CANCELLED,
        payload: {
          room_id: 'Atlas',
          date: '2026-05-01',
          slot: '09:00',
          user_name: 'Nadia',
        },
      },
    ]);

    const result = reserveSlot(store, {
      room_id: 'Atlas',
      date: '2026-05-01',
      slot: '09:00',
      user_name: 'Alex',
      expected_context_version: null,
    });

    expect(result).toEqual({
      status: 'conflict',
      message: 'Slot changed underneath your view. Reload current state and try again.',
    });
  });
});
