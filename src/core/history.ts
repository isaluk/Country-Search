import { HISTORY_LIMIT } from './constants.js';

const isPrefixOf = (text: string) => {
  const lowerText = text.toLowerCase();

  return (candidate: string) => lowerText.startsWith(candidate.toLowerCase());
};

export const addToHistory = (
  history: readonly string[],
  query: string,
  limit: number = HISTORY_LIMIT,
): string[] => {
  const entry = query.trim();

  if (entry === '') return [...history];

  const isTypingStep = isPrefixOf(entry);
  const rest = history.filter((item) => !isTypingStep(item));

  return [entry, ...rest].slice(0, limit);
};
