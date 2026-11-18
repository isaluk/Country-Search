import {
  API_BASE_URL,
  HTTP_NOT_FOUND,
  REQUEST_TIMEOUT_MS,
} from './constants.js';
import { HttpError } from './errors.js';
import { mapCountryResponse } from './map-country.js';
import type { Country, RawCountry } from './types.js';

export const buildSearchUrl = (query: string): string =>
  `${API_BASE_URL}/name/${encodeURIComponent(query)}`;

export const searchCountries = async (
  query: string,
  signal: AbortSignal,
): Promise<Country[]> => {
  const response = await fetch(buildSearchUrl(query), {
    signal: AbortSignal.any([signal, AbortSignal.timeout(REQUEST_TIMEOUT_MS)]),
  });

  if (response.status === HTTP_NOT_FOUND) return [];
  if (!response.ok) throw new HttpError(response.status, response.statusText);

  const raw = (await response.json()) as RawCountry[];

  return mapCountryResponse(raw);
};
