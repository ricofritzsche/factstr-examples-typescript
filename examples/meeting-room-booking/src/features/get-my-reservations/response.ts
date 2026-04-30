export type MyReservationView = {
  room_id: string;
  slot: string;
};

export type GetMyReservationsResponse = {
  date: string;
  user_name: string;
  reservations: MyReservationView[];
};
