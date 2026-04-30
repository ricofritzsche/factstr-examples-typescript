import type { GetMyReservationsResponse } from '../features/get-my-reservations/response';

const getDisplayUserName = (userName: string) => userName || 'this user';

export const renderMyReservations = (response: GetMyReservationsResponse): string => {
  const reservationsMarkup =
    response.reservations.length === 0
      ? `
          <p class="my-reservations-empty">
            No reservations for ${getDisplayUserName(response.user_name)} on ${response.date}.
          </p>
        `
      : `
          <ul class="my-reservations-list">
            ${response.reservations
              .map(
                (reservation) => `
                  <li class="my-reservations-item">
                    <span class="my-reservations-room">${reservation.room_id}</span>
                    <span class="my-reservations-slot">${reservation.slot}</span>
                  </li>
                `,
              )
              .join('')}
          </ul>
        `;

  return `
    <aside class="my-reservations-card">
      <header class="my-reservations-header">
        <p class="my-reservations-eyebrow">My Reservations</p>
        <h2>${getDisplayUserName(response.user_name)}</h2>
        <p class="my-reservations-date">${response.date}</p>
      </header>
      ${reservationsMarkup}
    </aside>
  `;
};
