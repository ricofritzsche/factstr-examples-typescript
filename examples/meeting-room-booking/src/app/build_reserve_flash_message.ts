import type { BookingBoardResponse, BookingBoardSlotView } from '../features/get-booking-board/response';
import type { ReserveSlotResponse } from '../features/reserve-slot/response';

type BuildReserveFlashMessageParams = {
  result: ReserveSlotResponse;
  board: BookingBoardResponse;
  roomId: string;
  slot: string;
};

const findSlot = (board: BookingBoardResponse, roomId: string, slot: string): BookingBoardSlotView | null => {
  const room = board.rooms.find((boardRoom) => boardRoom.room_id === roomId);

  if (!room) {
    return null;
  }

  return room.slots.find((boardSlot) => boardSlot.slot === slot) ?? null;
};

export const buildReserveFlashMessage = ({
  result,
  board,
  roomId,
  slot,
}: BuildReserveFlashMessageParams) => {
  const refreshedSlot = findSlot(board, roomId, slot);

  if (result.status === 'success') {
    return 'Reserved successfully.';
  }

  if (refreshedSlot?.status === 'reserved' && refreshedSlot.user_name) {
    if (result.status === 'conflict') {
      return `This slot changed and is now reserved by ${refreshedSlot.user_name}.`;
    }

    return `This slot is already reserved by ${refreshedSlot.user_name}.`;
  }

  if (result.status === 'conflict') {
    return 'This slot changed. Reload current state and try again.';
  }

  return 'This slot is already reserved.';
};
