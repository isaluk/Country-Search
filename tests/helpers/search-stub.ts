import { vi } from 'vitest';
import type { Country, SearchFn } from '../../src/core/types.js';

export interface SearchCall {
  readonly query: string;
  readonly signal: AbortSignal;
  readonly resolve: (countries: readonly Country[]) => void;
  readonly reject: (error: unknown) => void;
}

export const createSearchStub = () => {
  const calls: SearchCall[] = [];

  const search = vi.fn<SearchFn>(
    (query, signal) =>
      new Promise((resolve, reject) => {
        signal.addEventListener('abort', () => reject(signal.reason), {
          once: true,
        });
        calls.push({ query, signal, resolve, reject });
      }),
  );

  return { search, calls };
};
