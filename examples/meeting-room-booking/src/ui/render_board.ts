import type { BookingBoardResponse } from '../features/get-booking-board/response';
import type { GetMyReservationsResponse } from '../features/get-my-reservations/response';
import { renderMyReservations } from './render_my_reservations';

const statusLabel = (status: 'free' | 'reserved') =>
  status === 'reserved' ? 'Reserved' : 'Free';

const slotClassName = (status: 'free' | 'reserved') =>
  status === 'reserved' ? 'slot slot-reserved' : 'slot slot-free';

export const renderBoard = (
  board: BookingBoardResponse,
  myReservations: GetMyReservationsResponse,
): string => {
  const roomSections = board.rooms
    .map(
      (room) => `
        <section class="room-card">
          <header class="room-header">
            <h2>${room.room_id}</h2>
          </header>
          <ul class="slot-list">
            ${room.slots
              .map(
                (slot) => `
                  <li class="${slotClassName(slot.status)}">
                    <div class="slot-time">${slot.slot}</div>
                    <div class="slot-status">${statusLabel(slot.status)}</div>
                    <div class="slot-user">${slot.user_name ?? 'Available'}</div>
                    <button
                      class="${slot.status === 'free' ? 'slot-action-button reserve-slot-button' : 'slot-action-button cancel-slot-button'}"
                      data-room-id="${room.room_id}"
                      data-date="${board.date}"
                      data-slot="${slot.slot}"
                      data-status="${slot.status}"
                      type="button"
                    >
                      ${slot.status === 'free' ? 'Reserve' : 'Cancel'}
                    </button>
                  </li>
                `,
              )
              .join('')}
          </ul>
        </section>
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

      .board-grid {
        display: grid;
        gap: 16px;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      }

      .content-grid {
        display: grid;
        gap: 20px;
        align-items: start;
        grid-template-columns: minmax(0, 1fr) minmax(260px, 320px);
      }

      .my-reservations-card {
        border: 1px solid rgba(31, 41, 51, 0.08);
        border-radius: 20px;
        background: rgba(255, 255, 255, 0.86);
        box-shadow: 0 20px 40px rgba(31, 41, 51, 0.08);
        padding: 20px;
      }

      .my-reservations-header h2 {
        margin: 0;
        font-size: 1.1rem;
      }

      .my-reservations-eyebrow {
        margin: 0 0 8px;
        color: #6b7280;
        font-size: 0.8rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .my-reservations-date {
        margin: 8px 0 0;
        color: #52606d;
        font-size: 0.92rem;
      }

      .my-reservations-list {
        margin: 18px 0 0;
        padding: 0;
        list-style: none;
      }

      .my-reservations-item {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        padding: 12px 0;
        border-top: 1px solid rgba(31, 41, 51, 0.08);
      }

      .my-reservations-item:first-child {
        border-top: 0;
        padding-top: 0;
      }

      .my-reservations-room {
        font-weight: 600;
      }

      .my-reservations-slot {
        color: #52606d;
      }

      .my-reservations-empty {
        margin: 18px 0 0;
        color: #52606d;
        line-height: 1.5;
      }

      .room-card {
        border: 1px solid rgba(31, 41, 51, 0.08);
        border-radius: 20px;
        background: rgba(255, 255, 255, 0.86);
        box-shadow: 0 20px 40px rgba(31, 41, 51, 0.08);
        overflow: hidden;
      }

      .room-header {
        padding: 18px 20px 12px;
        border-bottom: 1px solid rgba(31, 41, 51, 0.08);
      }

      .room-header h2 {
        margin: 0;
        font-size: 1.05rem;
      }

      .slot-list {
        margin: 0;
        padding: 12px;
        list-style: none;
      }

      .slot {
        display: grid;
        gap: 4px;
        padding: 14px;
        border-radius: 14px;
      }

      .slot + .slot {
        margin-top: 10px;
      }

      .slot-free {
        background: #edf7ee;
      }

      .slot-reserved {
        background: #fff0dd;
      }

      .slot-time {
        font-size: 0.92rem;
        font-weight: 700;
      }

      .slot-status {
        color: #52606d;
        font-size: 0.84rem;
      }

      .slot-user {
        font-size: 0.95rem;
      }

      .slot-action-button {
        width: fit-content;
        margin-top: 8px;
        padding: 8px 12px;
        border: 0;
        border-radius: 999px;
        color: #fff;
        font: inherit;
        font-size: 0.88rem;
        font-weight: 600;
        cursor: pointer;
      }

      .reserve-slot-button {
        background: #1f2933;
      }

      .reserve-slot-button:hover {
        background: #111827;
      }

      .cancel-slot-button {
        background: #b45309;
      }

      .cancel-slot-button:hover {
        background: #92400e;
      }

      @media (max-width: 640px) {
        .page {
          padding: 24px 16px 36px;
        }

        .content-grid {
          grid-template-columns: 1fr;
        }
      }
    </style>

    <main class="page">
      <div class="layout">
        <header class="hero">
          <p class="eyebrow">Meeting Room Booking Board</p>
          <h1>${board.date}</h1>
          <p class="subtitle">
            Current room availability projected from immutable FACTSTR events.
          </p>
        </header>

        <section class="content-grid">
          <div class="board-grid">
            ${roomSections}
          </div>
          ${renderMyReservations(myReservations)}
        </section>
      </div>
    </main>
  `;
};
