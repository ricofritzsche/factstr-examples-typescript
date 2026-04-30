import type { CancelSlotRequest } from '../features/cancel-slot/request';
import type { CancelSlotResponse } from '../features/cancel-slot/response';
import type { ReserveSlotRequest } from '../features/reserve-slot/request';
import type { ReserveSlotResponse } from '../features/reserve-slot/response';
import { buildReserveFlashMessage } from './build_reserve_flash_message';
import { log } from './log';
import {
  loadBoard,
  refreshBoard,
  renderBoardScreen,
  type FlashState,
  type SlotAction,
} from './refresh_board';
import { navigateToBoardDate, shiftRouteDate, startRouter, type AppRoute } from './router';

const boardUrl = '/__meeting-room-booking/board';
const cancelUrl = '/__meeting-room-booking/cancel';
const reserveUrl = '/__meeting-room-booking/reserve';

const createWarningFlash = (message: string): FlashState => ({
  message,
  tone: 'warning',
});

export const runApp = () => {
  const app = document.querySelector<HTMLDivElement>('#app');

  if (!app) {
    throw new Error('Expected #app container');
  }

  log.info('app-started');

  let currentRoute: AppRoute | null = null;
  let flashState: FlashState = {
    message: 'Reserve or cancel a slot to append a new fact and rerender the board.',
    tone: 'neutral',
  };
  let currentUser = 'Alex';

  const reserveSlot = async (request: ReserveSlotRequest) => {
    const response = await fetch(reserveUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    return (await response.json()) as ReserveSlotResponse;
  };

  const cancelSlot = async (request: CancelSlotRequest) => {
    const response = await fetch(cancelUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    return (await response.json()) as CancelSlotResponse;
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
    if (!currentRoute) {
      return;
    }

    const previousDate = shiftRouteDate(currentRoute.date, -1);
    log.info('route-date-previous-day', { from: currentRoute.date, to: previousDate });
    navigateToBoardDate(previousDate);
  };

  const navigateNextDay = () => {
    if (!currentRoute) {
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

    await refreshBoard({
      app,
      boardUrl,
      flashState,
      route: currentRoute,
      currentUser,
      onUserNameChange: (value) => {
        currentUser = value;
      },
      onNavigatePreviousDay: navigatePreviousDay,
      onNavigateNextDay: navigateNextDay,
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
      const result = await reserveSlot({
        room_id: slotAction.roomId,
        date: slotAction.date,
        slot: slotAction.slot,
        user_name: trimmedUserName,
        expected_context_version: slotAction.contextVersion,
      });

      logCommandOutcome('reserve-slot', result, slotAction, trimmedUserName);

      if (!currentRoute) {
        return;
      }

      const refreshedBoard = await loadBoard(boardUrl, currentRoute);
      const message = buildReserveFlashMessage({
        result,
        board: refreshedBoard,
        roomId: slotAction.roomId,
        slot: slotAction.slot,
      });

      flashState = result.status === 'success' ? { message, tone: 'success' } : createWarningFlash(message);
      renderBoardScreen({
        app,
        board: refreshedBoard,
        flashState,
        route: currentRoute,
        currentUser,
        onUserNameChange: (value) => {
          currentUser = value;
        },
        onNavigatePreviousDay: navigatePreviousDay,
        onNavigateNextDay: navigateNextDay,
        onSlotAction: handleSlotAction,
      });
      return;
    }

    const result = await cancelSlot({
      room_id: slotAction.roomId,
      date: slotAction.date,
      slot: slotAction.slot,
      user_name: trimmedUserName,
      expected_context_version: slotAction.contextVersion,
    });

    logCommandOutcome('cancel-slot', result, slotAction, trimmedUserName);

    if (!currentRoute) {
      return;
    }

    const refreshedBoard = await loadBoard(boardUrl, currentRoute);

    flashState =
      result.status === 'success'
        ? { message: result.message, tone: 'success' }
        : createWarningFlash(result.message);

    renderBoardScreen({
      app,
      board: refreshedBoard,
      flashState,
      route: currentRoute,
      currentUser,
      onUserNameChange: (value) => {
        currentUser = value;
      },
      onNavigatePreviousDay: navigatePreviousDay,
      onNavigateNextDay: navigateNextDay,
      onSlotAction: handleSlotAction,
    });
  };

  startRouter({
    onRouteNormalized: ({ from, to }) => {
      log.warn('route-normalized', { from, to });
    },
    onRouteChange: async (route) => {
      currentRoute = route;
      log.info('route-changed', { route: route.hash, date: route.date });
      await renderCurrentBoard();
    },
  });
};
