import type { CancelSlotResponse } from '../features/cancel-slot/response';
import { postCancelSlot } from './post_cancel_slot';
import { rerenderBoardRoute } from './rerender_board_route';
import type { AppRoute } from './router';
import type { FlashState, SlotAction } from './refresh_board';

type HandleCancelSlotActionParams = {
  app: HTMLDivElement;
  boardUrl: string;
  myReservationsUrl: string;
  cancelUrl: string;
  actingUser: string;
  slotAction: SlotAction;
  createWarningFlash: (message: string) => FlashState;
  logCommandOutcome: (
    command: 'reserve-slot' | 'cancel-slot',
    result: CancelSlotResponse,
    slotAction: SlotAction,
    actingUser: string,
  ) => void;
  getCurrentRoute: () => AppRoute | null;
  getCurrentUser: () => string;
  setFlashState: (flashState: FlashState) => void;
  onUserNameChange: (value: string) => void;
  onUserNameCommit: () => Promise<void>;
  onNavigatePreviousDay: () => void;
  onNavigateNextDay: () => void;
  onNavigateEvents: () => void;
  onSlotAction: (slotAction: SlotAction) => Promise<void>;
};

export const handleCancelSlotAction = async ({
  app,
  boardUrl,
  myReservationsUrl,
  cancelUrl,
  actingUser,
  slotAction,
  createWarningFlash,
  logCommandOutcome,
  getCurrentRoute,
  getCurrentUser,
  setFlashState,
  onUserNameChange,
  onUserNameCommit,
  onNavigatePreviousDay,
  onNavigateNextDay,
  onNavigateEvents,
  onSlotAction,
}: HandleCancelSlotActionParams) => {
  const result = await postCancelSlot(cancelUrl, {
    room_id: slotAction.roomId,
    date: slotAction.date,
    slot: slotAction.slot,
    user_name: actingUser,
  });

  logCommandOutcome('cancel-slot', result, slotAction, actingUser);

  const currentRoute = getCurrentRoute();

  if (!currentRoute || currentRoute.kind !== 'board') {
    return;
  }

  await rerenderBoardRoute({
    app,
    boardUrl,
    myReservationsUrl,
    route: currentRoute,
    currentUser: getCurrentUser(),
    nextFlashState:
      result.status === 'success'
        ? { message: result.message, tone: 'success' }
        : createWarningFlash(result.message),
    setFlashState,
    onUserNameChange,
    onUserNameCommit,
    onNavigatePreviousDay,
    onNavigateNextDay,
    onNavigateEvents,
    onSlotAction,
  });
};
