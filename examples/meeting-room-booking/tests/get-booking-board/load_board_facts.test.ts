import { describe, expect, it, vi } from 'vitest';
import { SLOT_CANCELLED } from '../../src/events/slot_cancelled';
import { SLOT_RESERVED } from '../../src/events/slot_reserved';
import { loadBoardFacts } from '../../src/features/get-booking-board/load_board_facts';

describe('loadBoardFacts', () => {
  it('queries only the requested day of board facts', () => {
    const query = vi.fn().mockReturnValue({
      event_records: [],
      current_context_version: null,
    });

    const store = { query };

    loadBoardFacts(store as never, {
      date: '2026-05-01',
      room_ids: ['Atlas', 'Cedar'],
      slots: ['09:00', '10:00'],
    });

    expect(query).toHaveBeenCalledWith({
      filters: [
        {
          event_types: [SLOT_RESERVED, SLOT_CANCELLED],
          payload_predicates: [
            {
              date: '2026-05-01',
            },
          ],
        },
      ],
    });
  });
});
