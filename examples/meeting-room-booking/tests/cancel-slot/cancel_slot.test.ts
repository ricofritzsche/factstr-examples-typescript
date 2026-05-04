import { describe, expect, it } from 'vitest';
import type { AppendIfResult, EventQuery, NewEvent } from '@factstr/factstr-node';
import { FactstrMemoryStore } from '@factstr/factstr-node';
import { SLOT_CANCELLED } from '../../src/events/slot_cancelled';
import { SLOT_RESERVED } from '../../src/events/slot_reserved';
import { cancelSlot } from '../../src/features/cancel-slot/cancel_slot';

const simulateConcurrentChangeDuringAppendIf = (
  store: InstanceType<typeof FactstrMemoryStore>,
  concurrentEvent: NewEvent,
) => {
  const originalAppendIf = store.appendIf.bind(store);

  store.appendIf = (
    events: NewEvent[],
    query: EventQuery,
    expectedContextVersion?: bigint | null,
  ): AppendIfResult => {
    store.append([concurrentEvent]);

    return originalAppendIf(events, query, expectedContextVersion);
  };
};

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

  it('returns explicit rejection before append when another user owns the slot', () => {
    const store = new FactstrMemoryStore();
    store.append([
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

    const before = store.query({ filters: [{ event_types: [SLOT_RESERVED, SLOT_CANCELLED] }] })
      .event_records.length;

    const result = cancelSlot(store, {
      room_id: 'Atlas',
      date: '2026-05-01',
      slot: '09:00',
      user_name: 'Alex',
    });

    const after = store.query({ filters: [{ event_types: [SLOT_RESERVED, SLOT_CANCELLED] }] })
      .event_records.length;

    expect(result).toEqual({
      status: 'rejection',
      reason: 'slot-owned-by-another-user',
      message: 'Slot is reserved by Priya. Only the matching reserver can cancel it.',
    });
    expect(after).toBe(before);
  });

  it('returns explicit conflict when the slot changes between load and append', () => {
    const store = new FactstrMemoryStore();
    store.append([
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

    simulateConcurrentChangeDuringAppendIf(store, {
      event_type: SLOT_CANCELLED,
      payload: {
        room_id: 'Atlas',
        date: '2026-05-01',
        slot: '09:00',
        user_name: 'Priya',
      },
    });

    const result = cancelSlot(store, {
      room_id: 'Atlas',
      date: '2026-05-01',
      slot: '09:00',
      user_name: 'Priya',
    });

    expect(result).toEqual({
      status: 'conflict',
      message: 'Slot changed underneath your view. Reload current state and try again.',
    });
  });
});
