import type { FactstrMemoryStore } from '@factstr/factstr-node';
import { SLOT_CANCELLED } from '../../events/slot_cancelled';
import { SLOT_RESERVED } from '../../events/slot_reserved';
import type { GetMyReservationsRequest } from './request';

export const loadUserDayFacts = (
  store: FactstrMemoryStore,
  request: GetMyReservationsRequest,
) => {
  return store.query({
    filters: [
      {
        event_types: [SLOT_RESERVED, SLOT_CANCELLED],
        payload_predicates: [
          {
            date: request.date,
            user_name: request.user_name,
          },
        ],
      },
    ],
  });
};
