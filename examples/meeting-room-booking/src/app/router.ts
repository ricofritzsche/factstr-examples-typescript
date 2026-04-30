export type AppRoute = {
  kind: 'board';
  hash: '#/board';
};

const boardHash = '#/board';

const normalizeHash = (hash: string) => {
  return hash === boardHash ? boardHash : boardHash;
};

const readRoute = (): AppRoute => {
  return {
    kind: 'board',
    hash: boardHash,
  };
};

export const startRouter = (onRouteChange: (route: AppRoute) => void) => {
  const emitRoute = () => {
    const normalizedHash = normalizeHash(window.location.hash);

    if (window.location.hash !== normalizedHash) {
      window.location.hash = normalizedHash;
      return;
    }

    onRouteChange(readRoute());
  };

  window.addEventListener('hashchange', emitRoute);
  emitRoute();

  return () => {
    window.removeEventListener('hashchange', emitRoute);
  };
};
