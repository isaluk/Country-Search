import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { searchCountries } from '../src/core/api.js';
import {
  createSearchController,
  type SearchState,
} from '../src/core/search-controller.js';
import { RAW_ANTARCTICA, RAW_SPAIN } from './fixtures/raw-countries.js';
import { createFetchMock } from './helpers/fetch-mock.js';

const DELAY = 300;

const flushPromises = () => vi.advanceTimersByTimeAsync(0);

const namesOf = (state: SearchState): string[] =>
  state.status === 'success'
    ? state.countries.map((country) => country.name)
    : [];

describe('race of stale responses', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('shows only the latest query when an earlier request answers later', async () => {
    const { fetchMock, requests } = createFetchMock();
    const states: SearchState[] = [];
    const controller = createSearchController({
      search: searchCountries,
      onChange: (state) => states.push(state),
      delayMs: DELAY,
    });

    vi.stubGlobal('fetch', fetchMock);

    controller.handleInput('an');
    await vi.advanceTimersByTimeAsync(DELAY);

    controller.handleInput('spain');
    await vi.advanceTimersByTimeAsync(DELAY);

    const [staleRequest, latestRequest] = requests;

    latestRequest.respond([RAW_SPAIN]);
    await flushPromises();

    staleRequest.respond([RAW_ANTARCTICA]);
    await flushPromises();

    expect(controller.getState()).toMatchObject({
      status: 'success',
      query: 'spain',
    });
    expect(namesOf(controller.getState())).toEqual(['Spain']);
    expect(states.flatMap(namesOf)).not.toContain('Antarctica');
    expect(states.map((state) => state.status)).not.toContain('error');
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(staleRequest.signal.aborted).toBe(true);
    expect(latestRequest.signal.aborted).toBe(false);
  });
});
