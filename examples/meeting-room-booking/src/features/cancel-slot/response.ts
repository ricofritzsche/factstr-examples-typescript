export type CancelSlotSuccess = {
  status: 'success';
  message: string;
};

export type CancelSlotConflict = {
  status: 'conflict';
  message: string;
};

export type CancelSlotRejection = {
  status: 'rejection';
  reason: 'slot-already-free' | 'slot-owned-by-another-user';
  message: string;
};

export type CancelSlotResponse =
  | CancelSlotSuccess
  | CancelSlotConflict
  | CancelSlotRejection;
