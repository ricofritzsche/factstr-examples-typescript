import { boardRoomIds, boardSlots } from '../../app/board_defaults';
import type { CancelSlotRequest } from './request';

export type InvalidCancelRequest = {
  status: 'invalid-request';
  message: string;
};

const isValidIsoDate = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [yearText, monthText, dayText] = value.split('-');
  const year = Number.parseInt(yearText, 10);
  const month = Number.parseInt(monthText, 10);
  const day = Number.parseInt(dayText, 10);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
};

export const validateCancelRequest = (
  request: CancelSlotRequest,
): InvalidCancelRequest | null => {
  if (!boardRoomIds.includes(request.room_id as (typeof boardRoomIds)[number])) {
    return {
      status: 'invalid-request',
      message: 'Room must be one of the configured board rooms.',
    };
  }

  if (!boardSlots.includes(request.slot as (typeof boardSlots)[number])) {
    return {
      status: 'invalid-request',
      message: 'Slot must be one of the configured board slots.',
    };
  }

  if (!isValidIsoDate(request.date)) {
    return {
      status: 'invalid-request',
      message: 'Date must be a valid YYYY-MM-DD value.',
    };
  }

  if (request.user_name.trim().length === 0) {
    return {
      status: 'invalid-request',
      message: 'User name must be non-empty.',
    };
  }

  return null;
};
