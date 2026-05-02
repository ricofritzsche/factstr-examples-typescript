import { describe, expect, it } from 'vitest';
import { buildReserveFlashMessage } from '../../src/app/build_reserve_flash_message';
import type { BookingBoardResponse } from '../../src/features/booking-board/response';
import type { ReserveSlotResponse } from '../../src/features/reserve-slot/response';

const boardWithSlot = (status: 'free' | 'reserved', userName: string | null): BookingBoardResponse => ({
  date: '2026-05-01',
  rooms: [
    {
      room_id: 'Atlas',
      slots: [
        {
          slot: '09:00',
          status,
          user_name: userName,
        },
      ],
    },
  ],
});

const buildMessage = (result: ReserveSlotResponse, board: BookingBoardResponse) =>
  buildReserveFlashMessage({
    result,
    board,
    roomId: 'Atlas',
    slot: '09:00',
  });

describe('buildReserveFlashMessage', () => {
  it('returns a clear success message', () => {
    expect(
      buildMessage(
        {
          status: 'success',
          message: 'Reserved Atlas at 09:00 for Nadia.',
        },
        boardWithSlot('reserved', 'Nadia'),
      ),
    ).toBe('Reserved successfully.');
  });

  it('uses refreshed owner details for rejection', () => {
    expect(
      buildMessage(
        {
          status: 'rejection',
          reason: 'slot-already-reserved',
          message: 'Slot already reserved by Alex.',
        },
        boardWithSlot('reserved', 'Alex'),
      ),
    ).toBe('This slot is already reserved by Alex.');
  });

  it('uses refreshed owner details for conflict', () => {
    expect(
      buildMessage(
        {
          status: 'conflict',
          message: 'Slot changed underneath your view. Reload current state and try again.',
        },
        boardWithSlot('reserved', 'Alex'),
      ),
    ).toBe('This slot changed and is now reserved by Alex.');
  });

  it('falls back to a generic conflict message when refreshed owner data is unavailable', () => {
    expect(
      buildMessage(
        {
          status: 'conflict',
          message: 'Slot changed underneath your view. Reload current state and try again.',
        },
        boardWithSlot('free', null),
      ),
    ).toBe('This slot changed. Reload current state and try again.');
  });
});
