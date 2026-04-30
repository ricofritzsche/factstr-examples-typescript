export type CancelSlotRequest = {
  room_id: string;
  date: string;
  slot: string;
  user_name: string;
  expected_context_version: string | null;
};
