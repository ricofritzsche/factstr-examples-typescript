import type { FactstrMemoryStore } from '@factstr/factstr-node';
import { SLOT_CANCELLED } from '../../events/slot_cancelled';
import { SLOT_RESERVED } from '../../events/slot_reserved';
import type { GetBookingBoardRequest } from './request';

export const loadBoardFacts = (
  store: FactstrMemoryStore,
  request: GetBookingBoardRequest,
) => {
  return store.query({
    filters: [
      {
        event_types: [SLOT_RESERVED, SLOT_CANCELLED],
        payload_predicates: [
          {
            date: request.date,
          },
        ],
      },
    ],
  });
};
