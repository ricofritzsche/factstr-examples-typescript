import factstrNode from '@factstr/factstr-node';
import type { SlotCancelledEvent } from '../events/slot_cancelled';
import { SLOT_CANCELLED } from '../events/slot_cancelled';
import type { SlotReservedEvent } from '../events/slot_reserved';
import { SLOT_RESERVED } from '../events/slot_reserved';

const { FactstrMemoryStore } = factstrNode;

export const boardRequest = {
  date: '2026-05-01',
  room_ids: ['Atlas', 'Cedar', 'Harbor'],
  slots: ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00'],
} as const;

export const createStore = () => {
  const store = new FactstrMemoryStore();

  const seedEvents: Array<SlotReservedEvent | SlotCancelledEvent> = [
    {
      event_type: SLOT_RESERVED,
      payload: {
        room_id: 'Atlas',
        date: boardRequest.date,
        slot: '09:00',
        user_name: 'Nadia',
      },
    },
    {
      event_type: SLOT_RESERVED,
      payload: {
        room_id: 'Atlas',
        date: boardRequest.date,
        slot: '10:00',
        user_name: 'Leo',
      },
    },
    {
      event_type: SLOT_CANCELLED,
      payload: {
        room_id: 'Atlas',
        date: boardRequest.date,
        slot: '10:00',
        user_name: 'Leo',
      },
    },
    {
      event_type: SLOT_RESERVED,
      payload: {
        room_id: 'Cedar',
        date: boardRequest.date,
        slot: '11:00',
        user_name: 'Priya',
      },
    },
    {
      event_type: SLOT_RESERVED,
      payload: {
        room_id: 'Harbor',
        date: boardRequest.date,
        slot: '14:00',
        user_name: 'Mateo',
      },
    },
    {
      event_type: SLOT_RESERVED,
      payload: {
        room_id: 'Harbor',
        date: boardRequest.date,
        slot: '15:00',
        user_name: 'Sofia',
      },
    },
    {
      event_type: SLOT_RESERVED,
      payload: {
        room_id: 'Atlas',
        date: '2026-05-02',
        slot: '09:00',
        user_name: 'Ignored Future Day',
      },
    },
  ];

  store.append(seedEvents);

  return store;
};
