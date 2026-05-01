import {
  loadBoard,
  loadMyReservations,
  renderBoardScreen,
  type FlashState,
  type SlotAction,
} from './refresh_board';
import type { AppRoute } from './router';

type BoardRoute = Extract<AppRoute, { kind: 'board' }>;

type RerenderBoardRouteParams = {
  app: HTMLDivElement;
  boardUrl: string;
  myReservationsUrl: string;
  route: BoardRoute;
  currentUser: string;
  nextFlashState: FlashState;
  setFlashState: (flashState: FlashState) => void;
  onUserNameChange: (value: string) => void;
  onUserNameCommit: () => Promise<void>;
  onNavigatePreviousDay: () => void;
  onNavigateNextDay: () => void;
  onNavigateEvents: () => void;
  onSlotAction: (slotAction: SlotAction) => Promise<void>;
  existingBoard?: Awaited<ReturnType<typeof loadBoard>>;
};

export const rerenderBoardRoute = async ({
  app,
  boardUrl,
  myReservationsUrl,
  route,
  currentUser,
  nextFlashState,
  setFlashState,
  onUserNameChange,
  onUserNameCommit,
  onNavigatePreviousDay,
  onNavigateNextDay,
  onNavigateEvents,
  onSlotAction,
  existingBoard,
}: RerenderBoardRouteParams) => {
  const refreshedBoard = existingBoard ?? (await loadBoard(boardUrl, route));
  const refreshedMyReservations = await loadMyReservations(myReservationsUrl, route, currentUser);

  setFlashState(nextFlashState);

  renderBoardScreen({
    app,
    board: refreshedBoard,
    myReservations: refreshedMyReservations,
    flashState: nextFlashState,
    route,
    currentUser,
    onUserNameChange,
    onUserNameCommit,
    onNavigatePreviousDay,
    onNavigateNextDay,
    onNavigateEvents,
    onSlotAction,
  });
};
