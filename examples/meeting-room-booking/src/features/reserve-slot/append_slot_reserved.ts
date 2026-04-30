import type { AppendIfResult, FactstrMemoryStore, InteropEventQuery, InteropNewEvent } from '@factstr/factstr-node';

export const appendSlotReserved = (
  store: FactstrMemoryStore,
  event: InteropNewEvent,
  query: InteropEventQuery,
  expectedContextVersion?: bigint | null,
): AppendIfResult => {
  return store.appendIf([event], query, expectedContextVersion);
};
