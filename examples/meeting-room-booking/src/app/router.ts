import { defaultBoardDate } from './board_defaults';

export type AppRoute =
  | {
      kind: 'board';
      date: string;
      hash: string;
    }
  | {
      kind: 'events';
      hash: string;
    };

const boardPath = '/board';
const eventsPath = '/events';
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

const isValidDate = (value: string) => {
  if (!datePattern.test(value)) {
    return false;
  }

  const parsed = new Date(`${value}T00:00:00Z`);

  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
};

const buildBoardHash = (date: string) => {
  return `#${boardPath}?date=${date}`;
};

const buildEventsHash = () => {
  return `#${eventsPath}`;
};

const normalizeHash = (hash: string) => {
  const raw = hash.startsWith('#') ? hash.slice(1) : hash;
  const [path, search = ''] = raw.split('?');

  if (path === eventsPath) {
    return buildEventsHash();
  }

  if (path !== boardPath) {
    return buildBoardHash(defaultBoardDate);
  }

  const params = new URLSearchParams(search);
  const date = params.get('date');

  if (!date || !isValidDate(date)) {
    return buildBoardHash(defaultBoardDate);
  }

  return buildBoardHash(date);
};

const readRoute = (hash: string): AppRoute => {
  const normalized = normalizeHash(hash);
  const raw = normalized.startsWith('#') ? normalized.slice(1) : normalized;
  const [path, search = ''] = raw.split('?');

  if (path === eventsPath) {
    return {
      kind: 'events',
      hash: normalized,
    };
  }

  const params = new URLSearchParams(search);
  const date = params.get('date') ?? defaultBoardDate;

  return {
    kind: 'board',
    date,
    hash: normalized,
  };
};

export const shiftRouteDate = (date: string, dayOffset: number) => {
  const parsed = new Date(`${date}T00:00:00Z`);
  parsed.setUTCDate(parsed.getUTCDate() + dayOffset);
  return parsed.toISOString().slice(0, 10);
};

export const navigateToBoardDate = (date: string) => {
  window.location.hash = buildBoardHash(date);
};

export const navigateToEvents = () => {
  window.location.hash = buildEventsHash();
};

export const startRouter = ({
  onRouteChange,
  onRouteNormalized,
}: {
  onRouteChange: (route: AppRoute) => void;
  onRouteNormalized?: (details: { from: string; to: string }) => void;
}) => {
  const emitRoute = () => {
    const currentHash = window.location.hash;
    const normalizedHash = normalizeHash(currentHash);

    if (currentHash !== normalizedHash) {
      onRouteNormalized?.({ from: currentHash || '', to: normalizedHash });
      window.location.hash = normalizedHash;
      return;
    }

    onRouteChange(readRoute(normalizedHash));
  };

  window.addEventListener('hashchange', emitRoute);
  emitRoute();

  return () => {
    window.removeEventListener('hashchange', emitRoute);
  };
};
