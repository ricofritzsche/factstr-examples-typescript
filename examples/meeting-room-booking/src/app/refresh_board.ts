import type { BookingBoardResponse } from '../features/booking-board/response';
import type { GetMyReservationsResponse } from '../features/get-my-reservations/response';
import { renderBoard } from '../ui/render_board';
import { renderFlashMessage } from '../ui/render_flash_message';
import type { AppRoute } from './router';
import { log } from './log';

type BoardRoute = Extract<AppRoute, { kind: 'board' }>;

export type FlashState = {
  message: string;
  tone: 'neutral' | 'success' | 'warning';
};

export type SlotAction = {
  roomId: string;
  date: string;
  slot: string;
  status: 'free' | 'reserved';
};

type RefreshBoardParams = {
  app: HTMLDivElement;
  boardUrl: string;
  myReservationsUrl: string;
  flashState: FlashState;
  route: BoardRoute;
  currentUser: string;
  onSlotAction: (slotAction: SlotAction) => Promise<void>;
  onUserNameChange: (value: string) => void;
  onUserNameCommit: () => Promise<void>;
  onNavigatePreviousDay: () => void;
  onNavigateNextDay: () => void;
  onNavigateEvents: () => void;
};

type RenderBoardScreenParams = {
  app: HTMLDivElement;
  board: BookingBoardResponse;
  myReservations: GetMyReservationsResponse;
  flashState: FlashState;
  route: BoardRoute;
  currentUser: string;
  onSlotAction: (slotAction: SlotAction) => Promise<void>;
  onUserNameChange: (value: string) => void;
  onUserNameCommit: () => Promise<void>;
  onNavigatePreviousDay: () => void;
  onNavigateNextDay: () => void;
  onNavigateEvents: () => void;
};

export const loadBoard = async (boardUrl: string, route: BoardRoute) => {
  log.info('board-load-started', { route: route.hash, date: route.date });

  const response = await fetch(`${boardUrl}?date=${route.date}`);
  const board = (await response.json()) as BookingBoardResponse;

  log.info('board-load-finished', {
    route: route.hash,
    date: board.date,
    room_count: board.rooms.length,
  });

  return board;
};

export const loadMyReservations = async (
  myReservationsUrl: string,
  route: BoardRoute,
  currentUser: string,
) => {
  log.info('my-reservations-load-started', {
    route: route.hash,
    date: route.date,
    user_name: currentUser,
  });

  const response = await fetch(
    `${myReservationsUrl}?date=${route.date}&user_name=${encodeURIComponent(currentUser)}`,
  );
  const myReservations = (await response.json()) as GetMyReservationsResponse;

  log.info('my-reservations-load-finished', {
    route: route.hash,
    date: myReservations.date,
    user_name: myReservations.user_name,
    reservation_count: myReservations.reservations.length,
  });

  return myReservations;
};

export const renderBoardScreen = ({
  app,
  board,
  myReservations,
  flashState,
  route,
  currentUser,
  onSlotAction,
  onUserNameChange,
  onUserNameCommit,
  onNavigatePreviousDay,
  onNavigateNextDay,
  onNavigateEvents,
}: RenderBoardScreenParams) => {
  app.innerHTML = `
    <section style="max-width: 1100px; margin: 0 auto; padding: 24px 0px 0;">
      <div style="display: flex; flex-wrap: wrap; gap: 12px; align-items: center; justify-content: space-between; margin-bottom: 20px;">
        <div style="display: flex; flex-wrap: wrap; gap: 10px; align-items: center;">
          <button
            type="button"
            disabled
            style="padding: 10px 14px; border: 1px solid rgba(31, 41, 51, 0.12); border-radius: 999px; background: #1f2933; color: #fff; font: 600 0.92rem/1.2 'IBM Plex Sans', 'Segoe UI', sans-serif; cursor: default;"
          >
            Board
          </button>
          <button
            id="go-events"
            type="button"
            style="padding: 10px 14px; border: 1px solid rgba(31, 41, 51, 0.12); border-radius: 999px; background: rgba(255, 255, 255, 0.86); color: #1f2933; font: 600 0.92rem/1.2 'IBM Plex Sans', 'Segoe UI', sans-serif; cursor: pointer;"
          >
            Recent Events
          </button>
        </div>
        <div style="display: flex; gap: 10px;">
          <button
            id="previous-day"
            type="button"
            style="padding: 10px 14px; border: 1px solid rgba(31, 41, 51, 0.12); border-radius: 999px; background: rgba(255, 255, 255, 0.86); color: #1f2933; font: 600 0.92rem/1.2 'IBM Plex Sans', 'Segoe UI', sans-serif; cursor: pointer;"
          >
            Previous Day
          </button>
          <button
            id="next-day"
            type="button"
            style="padding: 10px 14px; border: 1px solid rgba(31, 41, 51, 0.12); border-radius: 999px; background: rgba(255, 255, 255, 0.86); color: #1f2933; font: 600 0.92rem/1.2 'IBM Plex Sans', 'Segoe UI', sans-serif; cursor: pointer;"
          >
            Next Day
          </button>
        </div>
      </div>
      <label for="user-name" style="display: block; margin-bottom: 8px; color: #334155; font: 600 0.95rem/1.4 'IBM Plex Sans', 'Segoe UI', sans-serif;">
        User
      </label>
      <div style="margin-bottom: 10px; color: #111827; font: 700 1.15rem/1.2 'IBM Plex Sans', 'Segoe UI', sans-serif;">
        ${route.date}
      </div>
      <input
        id="user-name"
        name="user-name"
        type="text"
        placeholder="Your name"
        value="${currentUser}"
        style="width: min(320px, 100%); padding: 12px 14px; border: 1px solid rgba(31, 41, 51, 0.16); border-radius: 12px; background: rgba(255, 255, 255, 0.86); font: 500 1rem/1.4 'IBM Plex Sans', 'Segoe UI', sans-serif;"
      />
      ${renderFlashMessage(flashState.message, flashState.tone)}
    </section>
    ${renderBoard(board, myReservations)}
  `;

  const input = document.querySelector<HTMLInputElement>('#user-name');
  if (input) {
    input.addEventListener('input', () => {
      onUserNameChange(input.value);
    });
    input.addEventListener('change', async () => {
      await onUserNameCommit();
    });
  }

  const previousDayButton = document.querySelector<HTMLButtonElement>('#previous-day');
  previousDayButton?.addEventListener('click', onNavigatePreviousDay);

  const nextDayButton = document.querySelector<HTMLButtonElement>('#next-day');
  nextDayButton?.addEventListener('click', onNavigateNextDay);

  const eventsButton = document.querySelector<HTMLButtonElement>('#go-events');
  eventsButton?.addEventListener('click', onNavigateEvents);

  document.querySelectorAll<HTMLButtonElement>('.slot-action-button').forEach((button) => {
    button.addEventListener('click', async () => {
      await onSlotAction({
        roomId: button.dataset.roomId ?? '',
        date: button.dataset.date ?? '',
        slot: button.dataset.slot ?? '',
        status: (button.dataset.status as 'free' | 'reserved') ?? 'free',
      });
    });
  });

  return board;
};

export const refreshBoard = async ({
  app,
  boardUrl,
  myReservationsUrl,
  flashState,
  route,
  currentUser,
  onSlotAction,
  onUserNameChange,
  onUserNameCommit,
  onNavigatePreviousDay,
  onNavigateNextDay,
  onNavigateEvents,
}: RefreshBoardParams) => {
  const board = await loadBoard(boardUrl, route);
  const myReservations = await loadMyReservations(myReservationsUrl, route, currentUser);

  return renderBoardScreen({
    app,
    board,
    myReservations,
    flashState,
    route,
    currentUser,
    onSlotAction,
    onUserNameChange,
    onUserNameCommit,
    onNavigatePreviousDay,
    onNavigateNextDay,
    onNavigateEvents,
  });
};
