export type ReserveSlotSuccess = {
  status: 'success';
  message: string;
};

export type ReserveSlotConflict = {
  status: 'conflict';
  message: string;
};

export type ReserveSlotRejection = {
  status: 'rejection';
  reason: 'slot-already-reserved';
  message: string;
};

export type ReserveSlotResponse =
  | ReserveSlotSuccess
  | ReserveSlotConflict
  | ReserveSlotRejection;
