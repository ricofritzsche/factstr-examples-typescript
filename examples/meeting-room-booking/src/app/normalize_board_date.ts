import { defaultBoardDate } from './board_defaults';

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

export const normalizeBoardDate = (value: string | null) => {
  if (!value || !datePattern.test(value)) {
    return defaultBoardDate;
  }

  const parsed = new Date(`${value}T00:00:00Z`);

  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
    return defaultBoardDate;
  }

  return value;
};
