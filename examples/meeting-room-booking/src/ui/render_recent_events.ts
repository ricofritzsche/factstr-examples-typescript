import type { RecentEventsResponse } from '../app/recent_events';

export const renderRecentEvents = (response: RecentEventsResponse): string => {
  const rows =
    response.events.length === 0
      ? `
          <tr>
            <td colspan="7" class="events-empty">No events available.</td>
          </tr>
        `
      : response.events
          .map(
            (event) => `
              <tr>
                <td>${event.sequence_number}</td>
                <td>${event.occurred_at}</td>
                <td>${event.event_type}</td>
                <td>${event.room_id}</td>
                <td>${event.date}</td>
                <td>${event.slot}</td>
                <td>${event.user_name}</td>
              </tr>
            `,
          )
          .join('');

  return `
    <style>
      :root {
        color: #1f2933;
        background: linear-gradient(180deg, #f5efe2 0%, #eef5f0 100%);
        font-family: "IBM Plex Sans", "Segoe UI", sans-serif;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
      }

      .page {
        min-height: 100vh;
        padding: 32px 20px 48px;
      }

      .layout {
        max-width: 1100px;
        margin: 0 auto;
      }

      .hero {
        margin-bottom: 24px;
      }

      .eyebrow {
        margin: 0 0 8px;
        color: #6b7280;
        font-size: 0.85rem;
        font-weight: 600;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      h1 {
        margin: 0 0 8px;
        font-size: clamp(2rem, 3vw, 3rem);
        line-height: 1;
      }

      .subtitle {
        margin: 0;
        max-width: 60ch;
        color: #52606d;
        line-height: 1.5;
      }

      .events-card {
        border: 1px solid rgba(31, 41, 51, 0.08);
        border-radius: 20px;
        background: rgba(255, 255, 255, 0.86);
        box-shadow: 0 20px 40px rgba(31, 41, 51, 0.08);
        overflow: hidden;
      }

      .events-table {
        width: 100%;
        border-collapse: collapse;
      }

      .events-table th,
      .events-table td {
        padding: 14px 16px;
        text-align: left;
        border-bottom: 1px solid rgba(31, 41, 51, 0.08);
        vertical-align: top;
      }

      .events-table th {
        background: rgba(245, 239, 226, 0.55);
        font-size: 0.8rem;
        letter-spacing: 0.05em;
        text-transform: uppercase;
      }

      .events-table tr:last-child td {
        border-bottom: 0;
      }

      .events-empty {
        color: #52606d;
      }

      @media (max-width: 800px) {
        .events-card {
          overflow-x: auto;
        }
      }

      @media (max-width: 640px) {
        .page {
          padding: 24px 16px 36px;
        }
      }
    </style>

    <main class="page">
      <div class="layout">
        <header class="hero">
          <p class="eyebrow">Store Transparency</p>
          <h1>Recent Events</h1>
          <p class="subtitle">
            The latest 10 facts from the in-memory FACTSTR store, shown in descending sequence order.
          </p>
        </header>

        <section class="events-card">
          <table class="events-table">
            <thead>
              <tr>
                <th>Seq</th>
                <th>Occurred At</th>
                <th>Type</th>
                <th>Room</th>
                <th>Date</th>
                <th>Slot</th>
                <th>User</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
        </section>
      </div>
    </main>
  `;
};
