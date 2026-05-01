import type { EventQuery, FactstrMemoryStore, QueryResult } from '@factstr/factstr-node';
import { SLOT_CANCELLED } from '../../events/slot_cancelled';
import { SLOT_RESERVED } from '../../events/slot_reserved';
import type { ReserveSlotRequest } from './request';

export type SlotContext = {
  query: EventQuery;
  result: QueryResult;
};

export const loadSlotContext = (
  store: FactstrMemoryStore,
  request: ReserveSlotRequest,
): SlotContext => {
  const query = {
    filters: [
      {
        event_types: [SLOT_RESERVED, SLOT_CANCELLED],
        payload_predicates: [
          {
            room_id: request.room_id,
            date: request.date,
            slot: request.slot,
          },
        ],
      },
    ],
  } satisfies EventQuery;

  return {
    query,
    result: store.query(query),
  };
};
