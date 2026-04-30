import type { CancelSlotRequest } from '../features/cancel-slot/request';
import type { CancelSlotResponse } from '../features/cancel-slot/response';
import type { ReserveSlotRequest } from '../features/reserve-slot/request';
import type { ReserveSlotResponse } from '../features/reserve-slot/response';
import { log } from './log';
import { refreshBoard, type FlashState, type SlotAction } from './refresh_board';
import { startRouter, type AppRoute } from './router';

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
  let userName = 'Alex';

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
  ) => {
    const details = {
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

  const refreshCurrentRoute = async () => {
    if (!currentRoute) {
      return;
    }

    await refreshBoard({
      app,
      boardUrl,
      flashState,
      route: currentRoute,
      userName,
      onUserNameChange: (value) => {
        userName = value;
      },
      onSlotAction: async (slotAction) => {
        const trimmedUserName = userName.trim();

        if (!trimmedUserName) {
          flashState = createWarningFlash('Enter a user name before changing a slot.');
          log.warn('slot-action-missing-user-name', {
            room_id: slotAction.roomId,
            date: slotAction.date,
            slot: slotAction.slot,
          });
          await refreshCurrentRoute();
          return;
        }

        const result =
          slotAction.status === 'reserved'
            ? await cancelSlot({
                room_id: slotAction.roomId,
                date: slotAction.date,
                slot: slotAction.slot,
                user_name: trimmedUserName,
                expected_context_version: slotAction.contextVersion,
              })
            : await reserveSlot({
                room_id: slotAction.roomId,
                date: slotAction.date,
                slot: slotAction.slot,
                user_name: trimmedUserName,
                expected_context_version: slotAction.contextVersion,
              });

        logCommandOutcome(
          slotAction.status === 'reserved' ? 'cancel-slot' : 'reserve-slot',
          result,
          slotAction,
        );

        flashState =
          result.status === 'success'
            ? { message: result.message, tone: 'success' }
            : createWarningFlash(result.message);

        await refreshCurrentRoute();
      },
    });
  };

  startRouter(async (route) => {
    currentRoute = route;
    log.info('route-changed', { route: route.hash });
    await refreshCurrentRoute();
  });
};
