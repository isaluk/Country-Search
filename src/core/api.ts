import type { Country } from './types.js';

export const buildSearchUrl = (_query: string): string => {
  throw new Error('Not implemented');
};

export const searchCountries = (
  _query: string,
  _signal: AbortSignal,
): Promise<Country[]> => {
  throw new Error('Not implemented');
};
