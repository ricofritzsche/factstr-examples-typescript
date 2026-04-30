import { describe, expect, it } from 'vitest';
import factstrNode from '@factstr/factstr-node';
import { SLOT_CANCELLED } from '../../src/events/slot_cancelled';
import { SLOT_RESERVED } from '../../src/events/slot_reserved';
import { cancelSlot } from '../../src/features/cancel-slot/cancel_slot';

const { FactstrMemoryStore } = factstrNode;

describe('cancelSlot', () => {
  it('appends a cancellation event on success', () => {
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

    const result = cancelSlot(store, {
      room_id: 'Atlas',
      date: '2026-05-01',
      slot: '09:00',
      user_name: 'Nadia',
      expected_context_version: '1',
    });

    expect(result).toEqual({
      status: 'success',
      message: 'Cancelled Atlas at 09:00.',
    });

    expect(
      store.query({
        filters: [
          {
            event_types: [SLOT_CANCELLED],
            payload_predicates: [{ room_id: 'Atlas', date: '2026-05-01', slot: '09:00' }],
          },
        ],
      }).event_records,
    ).toHaveLength(1);
  });

  it('returns explicit rejection before append when already free', () => {
    const store = new FactstrMemoryStore();

    const before = store.query({ filters: [{ event_types: [SLOT_RESERVED, SLOT_CANCELLED] }] })
      .event_records.length;

    const result = cancelSlot(store, {
      room_id: 'Atlas',
      date: '2026-05-01',
      slot: '09:00',
      user_name: 'Alex',
      expected_context_version: null,
    });

    const after = store.query({ filters: [{ event_types: [SLOT_RESERVED, SLOT_CANCELLED] }] })
      .event_records.length;

    expect(result).toEqual({
      status: 'rejection',
      reason: 'slot-already-free',
      message: 'Slot is already free.',
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
      {
        event_type: SLOT_RESERVED,
        payload: {
          room_id: 'Atlas',
          date: '2026-05-01',
          slot: '09:00',
          user_name: 'Priya',
        },
      },
    ]);

    const result = cancelSlot(store, {
      room_id: 'Atlas',
      date: '2026-05-01',
      slot: '09:00',
      user_name: 'Priya',
      expected_context_version: '1',
    });

    expect(result).toEqual({
      status: 'conflict',
      message: 'Slot changed underneath your view. Reload current state and try again.',
    });
  });
});
