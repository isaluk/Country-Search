import type { SearchFailure } from './errors.js';
import type { Country, SearchFn } from './types.js';

export type SearchState =
  | { readonly status: 'idle'; readonly query: '' }
  | { readonly status: 'loading'; readonly query: string }
  | {
      readonly status: 'success';
      readonly query: string;
      readonly countries: readonly Country[];
    }
  | { readonly status: 'empty'; readonly query: string }
  | {
      readonly status: 'error';
      readonly query: string;
      readonly failure: SearchFailure;
    };

export interface SearchControllerOptions {
  readonly search: SearchFn;
  readonly onChange: (state: SearchState) => void;
  readonly delayMs?: number;
}

export interface SearchController {
  readonly handleInput: (text: string) => void;
  readonly searchNow: (text: string) => void;
  readonly retry: () => void;
  readonly getState: () => SearchState;
}

export const createSearchController = (
  _options: SearchControllerOptions,
): SearchController => {
  throw new Error('Not implemented');
};
