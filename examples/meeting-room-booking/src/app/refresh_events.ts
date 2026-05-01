import type { RecentEventsResponse } from './recent_events';
import { renderRecentEvents } from '../ui/render_recent_events';
import type { AppRoute } from './router';
import { log } from './log';

type EventsRoute = Extract<AppRoute, { kind: 'events' }>;

type RefreshEventsParams = {
  app: HTMLDivElement;
  eventsUrl: string;
  route: EventsRoute;
  onNavigateBoard: () => void;
};

export const loadRecentEvents = async (eventsUrl: string) => {
  log.info('recent-events-load-started');

  const response = await fetch(eventsUrl);
  const recentEvents = (await response.json()) as RecentEventsResponse;

  log.info('recent-events-load-finished', {
    event_count: recentEvents.events.length,
  });

  return recentEvents;
};

export const renderEventsScreen = ({
  app,
  recentEvents,
  onNavigateBoard,
}: {
  app: HTMLDivElement;
  recentEvents: RecentEventsResponse;
  onNavigateBoard: () => void;
}) => {
  app.innerHTML = `
    <section style="max-width: 1100px; margin: 0 auto; padding: 24px 0 0;">
      <div style="display: flex; flex-wrap: wrap; gap: 10px; align-items: center; margin-bottom: 20px;">
        <button
          id="go-board"
          type="button"
          style="padding: 10px 14px; border: 1px solid rgba(31, 41, 51, 0.12); border-radius: 999px; background: rgba(255, 255, 255, 0.86); color: #1f2933; font: 600 0.92rem/1.2 'IBM Plex Sans', 'Segoe UI', sans-serif; cursor: pointer;"
        >
          Board
        </button>
        <button
          type="button"
          disabled
          style="padding: 10px 14px; border: 1px solid rgba(31, 41, 51, 0.12); border-radius: 999px; background: #1f2933; color: #fff; font: 600 0.92rem/1.2 'IBM Plex Sans', 'Segoe UI', sans-serif; cursor: default;"
        >
          Recent Events
        </button>
      </div>
    </section>
    ${renderRecentEvents(recentEvents)}
  `;

  const boardButton = document.querySelector<HTMLButtonElement>('#go-board');
  boardButton?.addEventListener('click', onNavigateBoard);
};

export const refreshEvents = async ({
  app,
  eventsUrl,
  route,
  onNavigateBoard,
}: RefreshEventsParams) => {
  const recentEvents = await loadRecentEvents(eventsUrl);

  renderEventsScreen({
    app,
    recentEvents,
    onNavigateBoard,
  });
};
