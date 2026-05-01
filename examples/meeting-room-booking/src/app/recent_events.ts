export type RecentEventView = {
  sequence_number: string;
  event_type: string;
  room_id: string;
  date: string;
  slot: string;
  user_name: string;
};

export type RecentEventsResponse = {
  events: RecentEventView[];
};
