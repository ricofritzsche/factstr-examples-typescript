import type { FactstrMemoryStore } from '@factstr/factstr-node';
import { SLOT_CANCELLED } from '../events/slot_cancelled';
import { SLOT_RESERVED } from '../events/slot_reserved';
import type { RecentEventsResponse } from './recent_events';
import { runtimeLog } from './runtime_log';
import type { HttpResponse } from './http_types';

export const httpGetRecentEvents = (
  store: FactstrMemoryStore,
  response: HttpResponse,
) => {
  const result = store.query({
    filters: [
      {
        event_types: [SLOT_RESERVED, SLOT_CANCELLED],
      },
    ],
  });

  const recentEvents: RecentEventsResponse = {
    events: [...result.event_records]
      .sort((left, right) => {
        if (left.sequence_number === right.sequence_number) {
          return 0;
        }

        return left.sequence_number > right.sequence_number ? -1 : 1;
      })
      .slice(0, 10)
      .map((event) => {
        const payload = event.payload as {
          room_id: string;
          date: string;
          slot: string;
          user_name: string;
        };

        return {
          sequence_number: event.sequence_number.toString(),
          occurred_at: event.occurred_at,
          event_type: event.event_type,
          room_id: payload.room_id,
          date: payload.date,
          slot: payload.slot,
          user_name: payload.user_name,
        };
      }),
  };

  runtimeLog.info('recent-events-requested', {
    route: '/__meeting-room-booking/events',
    event_count: recentEvents.events.length,
  });

  response.setHeader('content-type', 'application/json; charset=utf-8');
  response.end(JSON.stringify(recentEvents));
};
