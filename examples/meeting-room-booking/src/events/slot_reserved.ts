export const SLOT_RESERVED = 'slot-reserved';

export type SlotReservedPayload = {
  room_id: string;
  date: string;
  slot: string;
  user_name: string;
};

export type SlotReservedEvent = {
  event_type: typeof SLOT_RESERVED;
  payload: SlotReservedPayload;
};
