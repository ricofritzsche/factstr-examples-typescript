export const SLOT_CANCELLED = 'slot-cancelled';

export type SlotCancelledPayload = {
  room_id: string;
  date: string;
  slot: string;
  user_name: string;
};

export type SlotCancelledEvent = {
  event_type: typeof SLOT_CANCELLED;
  payload: SlotCancelledPayload;
};
