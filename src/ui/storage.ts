const HISTORY_KEY = 'country-search:history';

const isString = (value: unknown): value is string => typeof value === 'string';

export const loadHistory = (): string[] => {
  try {
    const parsed: unknown = JSON.parse(
      localStorage.getItem(HISTORY_KEY) ?? '[]',
    );

    return Array.isArray(parsed) ? parsed.filter(isString) : [];
  } catch {
    return [];
  }
};

export const saveHistory = (history: readonly string[]): boolean => {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));

    return true;
  } catch {
    return false;
  }
};
