import { DEBOUNCE_DELAY_MS } from './constants.js';
import { debounce } from './debounce.js';
import { classifyError, type SearchFailure } from './errors.js';
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

const IDLE_STATE: SearchState = { status: 'idle', query: '' };

const normalizeQuery = (text: string): string => text.trim();

export const createSearchController = ({
  search,
  onChange,
  delayMs = DEBOUNCE_DELAY_MS,
}: SearchControllerOptions): SearchController => {
  let state: SearchState = IDLE_STATE;
  let activeRequest: AbortController | null = null;

  const setState = (next: SearchState) => {
    state = next;
    onChange(state);
  };

  const runSearch = async (query: string): Promise<void> => {
    const request = new AbortController();
    activeRequest = request;

    try {
      const countries = await search(query, request.signal);

      setState(
        countries.length > 0
          ? { status: 'success', query, countries }
          : { status: 'empty', query },
      );
    } catch (error) {
      const outcome = classifyError(error);

      if (outcome.kind === 'aborted') return;

      setState({ status: 'error', query, failure: outcome });
    }
  };

  const runSearchNow = (query: string) => {
    void runSearch(query);
  };

  const runSearchLater = debounce(runSearchNow, delayMs);

  const cancelPendingWork = () => {
    runSearchLater.cancel();
    activeRequest?.abort();
    activeRequest = null;
  };

  const startSearch = (text: string, launch: (query: string) => void) => {
    cancelPendingWork();

    const query = normalizeQuery(text);

    if (query === '') {
      setState(IDLE_STATE);
      return;
    }

    setState({ status: 'loading', query });
    launch(query);
  };

  return {
    handleInput: (text) => startSearch(text, runSearchLater),
    searchNow: (text) => startSearch(text, runSearchNow),
    retry: () => startSearch(state.query, runSearchNow),
    getState: () => state,
  };
};
