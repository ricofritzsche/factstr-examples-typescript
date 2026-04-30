export type BookingBoardSlotView = {
  slot: string;
  status: 'free' | 'reserved';
  user_name: string | null;
  slot_context_version: string | null;
};

export type BookingBoardRoomView = {
  room_id: string;
  slots: BookingBoardSlotView[];
};

export type BookingBoardResponse = {
  date: string;
  rooms: BookingBoardRoomView[];
};
