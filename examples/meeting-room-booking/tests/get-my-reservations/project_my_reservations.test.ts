import { describe, expect, it } from 'vitest';
import { SLOT_CANCELLED } from '../../src/events/slot_cancelled';
import { SLOT_RESERVED } from '../../src/events/slot_reserved';
import { projectMyReservations } from '../../src/features/get-my-reservations/project_my_reservations';

describe('projectMyReservations', () => {
  it('keeps only current active reservations for the selected user and date', () => {
    const response = projectMyReservations(
      {
        date: '2026-05-01',
        user_name: 'Alex',
      },
      [
        {
          event_type: SLOT_RESERVED,
          payload: {
            room_id: 'Harbor',
            date: '2026-05-01',
            slot: '15:00',
            user_name: 'Alex',
          },
        },
        {
          event_type: SLOT_RESERVED,
          payload: {
            room_id: 'Atlas',
            date: '2026-05-01',
            slot: '09:00',
            user_name: 'Alex',
          },
        },
        {
          event_type: SLOT_CANCELLED,
          payload: {
            room_id: 'Atlas',
            date: '2026-05-01',
            slot: '09:00',
            user_name: 'Alex',
          },
        },
        {
          event_type: SLOT_RESERVED,
          payload: {
            room_id: 'Cedar',
            date: '2026-05-01',
            slot: '11:00',
            user_name: 'Priya',
          },
        },
        {
          event_type: SLOT_RESERVED,
          payload: {
            room_id: 'Atlas',
            date: '2026-05-02',
            slot: '10:00',
            user_name: 'Alex',
          },
        },
      ],
    );

    expect(response).toEqual({
      date: '2026-05-01',
      user_name: 'Alex',
      reservations: [
        {
          room_id: 'Harbor',
          slot: '15:00',
        },
      ],
    });
  });

  it('keeps a reservation active when it is reserved again after cancellation', () => {
    const response = projectMyReservations(
      {
        date: '2026-05-01',
        user_name: 'Alex',
      },
      [
        {
          event_type: SLOT_RESERVED,
          payload: {
            room_id: 'Atlas',
            date: '2026-05-01',
            slot: '10:00',
            user_name: 'Alex',
          },
        },
        {
          event_type: SLOT_CANCELLED,
          payload: {
            room_id: 'Atlas',
            date: '2026-05-01',
            slot: '10:00',
            user_name: 'Alex',
          },
        },
        {
          event_type: SLOT_RESERVED,
          payload: {
            room_id: 'Atlas',
            date: '2026-05-01',
            slot: '10:00',
            user_name: 'Alex',
          },
        },
      ],
    );

    expect(response.reservations).toEqual([
      {
        room_id: 'Atlas',
        slot: '10:00',
      },
    ]);
  });
});
