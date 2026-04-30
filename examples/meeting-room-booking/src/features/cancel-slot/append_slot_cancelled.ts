import type { AppendIfResult, FactstrMemoryStore, InteropEventQuery, InteropNewEvent } from '@factstr/factstr-node';

export const appendSlotCancelled = (
  store: FactstrMemoryStore,
  event: InteropNewEvent,
  query: InteropEventQuery,
  expectedContextVersion?: bigint | null,
): AppendIfResult => {
  return store.appendIf([event], query, expectedContextVersion);
};
