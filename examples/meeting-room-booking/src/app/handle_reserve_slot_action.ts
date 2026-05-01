import { buildReserveFlashMessage } from './build_reserve_flash_message';
import { loadBoard, type FlashState, type SlotAction } from './refresh_board';
import { postReserveSlot } from './post_reserve_slot';
import { rerenderBoardRoute } from './rerender_board_route';
import type { AppRoute } from './router';
import type { ReserveSlotResponse } from '../features/reserve-slot/response';

type HandleReserveSlotActionParams = {
  app: HTMLDivElement;
  boardUrl: string;
  myReservationsUrl: string;
  reserveUrl: string;
  actingUser: string;
  slotAction: SlotAction;
  createWarningFlash: (message: string) => FlashState;
  logCommandOutcome: (
    command: 'reserve-slot' | 'cancel-slot',
    result: ReserveSlotResponse,
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

export const handleReserveSlotAction = async ({
  app,
  boardUrl,
  myReservationsUrl,
  reserveUrl,
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
}: HandleReserveSlotActionParams) => {
  const result = await postReserveSlot(reserveUrl, {
    room_id: slotAction.roomId,
    date: slotAction.date,
    slot: slotAction.slot,
    user_name: actingUser,
    expected_context_version: slotAction.contextVersion,
  });

  logCommandOutcome('reserve-slot', result, slotAction, actingUser);

  const currentRoute = getCurrentRoute();

  if (!currentRoute || currentRoute.kind !== 'board') {
    return;
  }

  const refreshedBoard = await loadBoard(boardUrl, currentRoute);
  const message = buildReserveFlashMessage({
    result,
    board: refreshedBoard,
    roomId: slotAction.roomId,
    slot: slotAction.slot,
  });

  await rerenderBoardRoute({
    app,
    boardUrl,
    myReservationsUrl,
    route: currentRoute,
    currentUser: getCurrentUser(),
    nextFlashState:
      result.status === 'success' ? { message, tone: 'success' } : createWarningFlash(message),
    setFlashState,
    onUserNameChange,
    onUserNameCommit,
    onNavigatePreviousDay,
    onNavigateNextDay,
    onNavigateEvents,
    onSlotAction,
    existingBoard: refreshedBoard,
  });
};
