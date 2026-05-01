import type { CancelSlotResponse } from '../features/cancel-slot/response';
import type { ReserveSlotResponse } from '../features/reserve-slot/response';
import { defaultBoardDate } from './board_defaults';
import { handleCancelSlotAction } from './handle_cancel_slot_action';
import { handleReserveSlotAction } from './handle_reserve_slot_action';
import { log } from './log';
import { refreshBoard, type FlashState, type SlotAction } from './refresh_board';
import { refreshEvents } from './refresh_events';
import {
  navigateToBoardDate,
  navigateToEvents,
  shiftRouteDate,
  startRouter,
  type AppRoute,
} from './router';

const boardUrl = '/__meeting-room-booking/board';
const cancelUrl = '/__meeting-room-booking/cancel';
const eventsUrl = '/__meeting-room-booking/events';
const myReservationsUrl = '/__meeting-room-booking/my-reservations';
const reserveUrl = '/__meeting-room-booking/reserve';

const defaultUserNames = [
  'Alex',
  'Nadia',
  'Leo',
  'Priya',
  'Mateo',
  'Sofia',
  'Mina',
  'Jonah',
];

const createWarningFlash = (message: string): FlashState => ({
  message,
  tone: 'warning',
});

const pickRandomDefaultUserName = () => {
  const randomIndex = Math.floor(Math.random() * defaultUserNames.length);

  return defaultUserNames[randomIndex];
};

export const runApp = () => {
  const app = document.querySelector<HTMLDivElement>('#app');

  if (!app) {
    throw new Error('Expected #app container');
  }

  log.info('app-started');

  let currentRoute: AppRoute | null = null;
  let lastBoardDate = defaultBoardDate;
  let flashState: FlashState = {
    message: 'Reserve or cancel a slot to append a new fact and rerender the board.',
    tone: 'neutral',
  };
  let currentUser = pickRandomDefaultUserName();
  const setCurrentUser = (value: string) => {
    currentUser = value;
  };
  const setFlashState = (nextFlashState: FlashState) => {
    flashState = nextFlashState;
  };

  const logCommandOutcome = (
    command: 'reserve-slot' | 'cancel-slot',
    result: ReserveSlotResponse | CancelSlotResponse,
    slotAction: SlotAction,
    actingUser: string,
  ) => {
    const details = {
      acting_user: actingUser,
      room_id: slotAction.roomId,
      date: slotAction.date,
      slot: slotAction.slot,
      status: result.status,
      message: result.message,
    };

    if (result.status === 'success') {
      log.info(`${command}-success`, details);
      return;
    }

    if (result.status === 'conflict') {
      log.warn(`${command}-conflict`, details);
      return;
    }

    log.warn(`${command}-rejection`, details);
  };

  const navigatePreviousDay = () => {
    if (!currentRoute || currentRoute.kind !== 'board') {
      return;
    }

    const previousDate = shiftRouteDate(currentRoute.date, -1);
    log.info('route-date-previous-day', { from: currentRoute.date, to: previousDate });
    navigateToBoardDate(previousDate);
  };

  const navigateNextDay = () => {
    if (!currentRoute || currentRoute.kind !== 'board') {
      return;
    }

    const nextDate = shiftRouteDate(currentRoute.date, 1);
    log.info('route-date-next-day', { from: currentRoute.date, to: nextDate });
    navigateToBoardDate(nextDate);
  };

  const renderCurrentBoard = async () => {
    if (!currentRoute) {
      return;
    }

    if (currentRoute.kind === 'events') {
      await refreshEvents({
        app,
        eventsUrl,
        route: currentRoute,
        onNavigateBoard: () => {
          navigateToBoardDate(lastBoardDate);
        },
      });
      return;
    }

    await refreshBoard({
      app,
      boardUrl,
      myReservationsUrl,
      flashState,
      route: currentRoute,
      currentUser,
      onUserNameChange: setCurrentUser,
      onUserNameCommit: renderCurrentBoard,
      onNavigatePreviousDay: navigatePreviousDay,
      onNavigateNextDay: navigateNextDay,
      onNavigateEvents: navigateToEvents,
      onSlotAction: handleSlotAction,
    });
  };

  const handleSlotAction = async (slotAction: SlotAction) => {
    const trimmedUserName = currentUser.trim();

    if (!trimmedUserName) {
      flashState = createWarningFlash('Enter a user name before changing a slot.');
      log.warn('slot-action-missing-user-name', {
        acting_user: currentUser,
        room_id: slotAction.roomId,
        date: slotAction.date,
        slot: slotAction.slot,
      });
      await renderCurrentBoard();
      return;
    }

    if (slotAction.status === 'free') {
      if (!currentRoute || currentRoute.kind !== 'board') {
        return;
      }

      await handleReserveSlotAction({
        app,
        boardUrl,
        myReservationsUrl,
        reserveUrl,
        actingUser: trimmedUserName,
        slotAction,
        createWarningFlash,
        logCommandOutcome,
        getCurrentRoute: () => currentRoute,
        getCurrentUser: () => currentUser,
        setFlashState,
        onUserNameChange: setCurrentUser,
        onUserNameCommit: renderCurrentBoard,
        onNavigatePreviousDay: navigatePreviousDay,
        onNavigateNextDay: navigateNextDay,
        onNavigateEvents: navigateToEvents,
        onSlotAction: handleSlotAction,
      });
      return;
    }

    if (!currentRoute || currentRoute.kind !== 'board') {
      return;
    }

    await handleCancelSlotAction({
      app,
      boardUrl,
      myReservationsUrl,
      cancelUrl,
      actingUser: trimmedUserName,
      slotAction,
      createWarningFlash,
      logCommandOutcome,
      getCurrentRoute: () => currentRoute,
      getCurrentUser: () => currentUser,
      setFlashState,
      onUserNameChange: setCurrentUser,
      onUserNameCommit: renderCurrentBoard,
      onNavigatePreviousDay: navigatePreviousDay,
      onNavigateNextDay: navigateNextDay,
      onNavigateEvents: navigateToEvents,
      onSlotAction: handleSlotAction,
    });
  };

  startRouter({
    onRouteNormalized: ({ from, to }) => {
      log.warn('route-normalized', { from, to });
    },
    onRouteChange: async (route) => {
      currentRoute = route;
      if (route.kind === 'board') {
        lastBoardDate = route.date;
      }
      log.info(
        'route-changed',
        route.kind === 'board'
          ? { route: route.hash, kind: route.kind, date: route.date }
          : { route: route.hash, kind: route.kind },
      );
      await renderCurrentBoard();
    },
  });
};
