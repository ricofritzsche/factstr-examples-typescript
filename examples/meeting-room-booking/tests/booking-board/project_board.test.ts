import { describe, expect, it } from 'vitest';
import { SLOT_CANCELLED } from '../../src/events/slot_cancelled';
import { SLOT_RESERVED } from '../../src/events/slot_reserved';
import { projectBoard } from '../../src/features/booking-board/project_board';
import type { GetBookingBoardRequest } from '../../src/features/booking-board/request';

const request: GetBookingBoardRequest = {
  date: '2026-05-01',
  room_ids: ['Atlas', 'Cedar'],
  slots: ['09:00', '10:00'],
};

describe('projectBoard', () => {
  it('shows reserved slots as reserved', () => {
    const board = projectBoard(
      request,
      [
        {
          event_type: SLOT_RESERVED,
          payload: {
            room_id: 'Atlas',
            date: '2026-05-01',
            slot: '09:00',
            user_name: 'Nadia',
          },
        },
      ],
    );

    expect(board.rooms[0]?.slots[0]).toEqual({
      slot: '09:00',
      status: 'reserved',
      user_name: 'Nadia',
    });
  });

  it('turns a cancelled slot back to free', () => {
    const board = projectBoard(
      request,
      [
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
      ],
    );

    expect(board.rooms[0]?.slots[0]).toEqual({
      slot: '09:00',
      status: 'free',
      user_name: null,
    });
  });

  it('lets the latest relevant fact win for a slot', () => {
    const board = projectBoard(
      request,
      [
        {
          event_type: SLOT_RESERVED,
          payload: {
            room_id: 'Atlas',
            date: '2026-05-01',
            slot: '10:00',
            user_name: 'Leo',
          },
        },
        {
          event_type: SLOT_CANCELLED,
          payload: {
            room_id: 'Atlas',
            date: '2026-05-01',
            slot: '10:00',
            user_name: 'Leo',
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

    expect(board.rooms[0]?.slots[1]).toEqual({
      slot: '10:00',
      status: 'reserved',
      user_name: 'Alex',
    });
  });

  it('handles multiple rooms and slots correctly', () => {
    const board = projectBoard(
      request,
      [
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
          event_type: SLOT_RESERVED,
          payload: {
            room_id: 'Cedar',
            date: '2026-05-01',
            slot: '10:00',
            user_name: 'Priya',
          },
        },
        {
          event_type: SLOT_RESERVED,
          payload: {
            room_id: 'Atlas',
            date: '2026-05-02',
            slot: '09:00',
            user_name: 'Ignored',
          },
        },
      ],
    );

    expect(board.rooms).toEqual([
      {
        room_id: 'Atlas',
        slots: [
          {
            slot: '09:00',
            status: 'reserved',
            user_name: 'Nadia',
          },
          {
            slot: '10:00',
            status: 'free',
            user_name: null,
          },
        ],
      },
      {
        room_id: 'Cedar',
        slots: [
          {
            slot: '09:00',
            status: 'free',
            user_name: null,
          },
          {
            slot: '10:00',
            status: 'reserved',
            user_name: 'Priya',
          },
        ],
      },
    ]);
  });
});
