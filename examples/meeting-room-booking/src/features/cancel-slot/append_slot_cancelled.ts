import type { AppendIfResult, EventQuery, FactstrMemoryStore, NewEvent } from '@factstr/factstr-node';

export const appendSlotCancelled = (
  store: FactstrMemoryStore,
  event: NewEvent,
  query: EventQuery,
  expectedContextVersion?: bigint | null,
): AppendIfResult => {
  return store.appendIf([event], query, expectedContextVersion);
};
