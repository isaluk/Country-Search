import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HttpError } from '../src/core/errors.js';
import {
  createSearchController,
  type SearchState,
} from '../src/core/search-controller.js';
import { createCountry } from './fixtures/countries.js';
import { createSearchStub } from './helpers/search-stub.js';

const DELAY = 300;

const setup = () => {
  const stub = createSearchStub();
  const states: SearchState[] = [];
  const controller = createSearchController({
    search: stub.search,
    onChange: (state) => states.push(state),
    delayMs: DELAY,
  });

  return { ...stub, states, controller };
};

const flushPromises = () => vi.advanceTimersByTimeAsync(0);

describe('createSearchController', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('input', () => {
    it('starts in the idle state', () => {
      const { controller } = setup();

      expect(controller.getState()).toEqual({ status: 'idle', query: '' });
    });

    it('does not search for an empty or blank input', () => {
      const { controller, search } = setup();

      controller.handleInput('');
      controller.handleInput('   ');
      vi.advanceTimersByTime(DELAY);

      expect(search).not.toHaveBeenCalled();
      expect(controller.getState()).toEqual({ status: 'idle', query: '' });
    });

    it('shows loading at once but sends the request only after the delay', () => {
      const { controller, search } = setup();

      controller.handleInput('spain');

      expect(controller.getState()).toEqual({
        status: 'loading',
        query: 'spain',
      });
      expect(search).not.toHaveBeenCalled();

      vi.advanceTimersByTime(DELAY);

      expect(search).toHaveBeenCalledTimes(1);
    });

    it('sends one request with the final text for a burst of typing', () => {
      const { controller, calls } = setup();

      controller.handleInput('s');
      controller.handleInput('sp');
      controller.handleInput('spain');
      vi.advanceTimersByTime(DELAY);

      expect(calls.map((call) => call.query)).toEqual(['spain']);
    });

    it('trims the query', () => {
      const { controller, calls } = setup();

      controller.handleInput('  spain ');
      vi.advanceTimersByTime(DELAY);

      expect(calls[0].query).toBe('spain');
    });
  });

  describe('results', () => {
    it('goes to success with the found countries', async () => {
      const { controller, calls } = setup();
      const countries = [createCountry()];

      controller.handleInput('spain');
      vi.advanceTimersByTime(DELAY);
      calls[0].resolve(countries);
      await flushPromises();

      expect(controller.getState()).toEqual({
        status: 'success',
        query: 'spain',
        countries,
      });
    });

    it('goes to empty when nothing is found', async () => {
      const { controller, calls } = setup();

      controller.handleInput('qwerty');
      vi.advanceTimersByTime(DELAY);
      calls[0].resolve([]);
      await flushPromises();

      expect(controller.getState()).toEqual({
        status: 'empty',
        query: 'qwerty',
      });
    });

    it('goes to error with the failure kind when the request fails', async () => {
      const { controller, calls } = setup();

      controller.handleInput('spain');
      vi.advanceTimersByTime(DELAY);
      calls[0].reject(new HttpError(500));
      await flushPromises();

      expect(controller.getState()).toEqual({
        status: 'error',
        query: 'spain',
        failure: { kind: 'http', status: 500 },
      });
    });

    it('reports a timeout as an error, not as a cancellation', async () => {
      const { controller, calls } = setup();

      controller.handleInput('spain');
      vi.advanceTimersByTime(DELAY);
      calls[0].reject(new DOMException('Timed out', 'TimeoutError'));
      await flushPromises();

      expect(controller.getState()).toMatchObject({
        status: 'error',
        failure: { kind: 'timeout' },
      });
    });
  });

  describe('cancellation', () => {
    it('aborts the active request on every input change, before the delay ends', () => {
      const { controller, calls } = setup();

      controller.handleInput('sp');
      vi.advanceTimersByTime(DELAY);
      controller.handleInput('spa');

      expect(calls[0].signal.aborted).toBe(true);
    });

    it('never shows its own cancellation as an error', async () => {
      const { controller, calls, states } = setup();

      controller.handleInput('sp');
      vi.advanceTimersByTime(DELAY);
      controller.handleInput('spain');
      await flushPromises();
      vi.advanceTimersByTime(DELAY);
      calls[1].resolve([createCountry()]);
      await flushPromises();

      expect(states.map((state) => state.status)).toEqual([
        'loading',
        'loading',
        'success',
      ]);
    });

    it('aborts the request and becomes idle when the input is cleared', async () => {
      const { controller, calls } = setup();

      controller.handleInput('spain');
      vi.advanceTimersByTime(DELAY);
      controller.handleInput('');
      await flushPromises();

      expect(calls[0].signal.aborted).toBe(true);
      expect(controller.getState()).toEqual({ status: 'idle', query: '' });
    });

    it('drops the scheduled search when the input is cleared during the delay', () => {
      const { controller, search } = setup();

      controller.handleInput('spain');
      controller.handleInput('');
      vi.advanceTimersByTime(DELAY);

      expect(search).not.toHaveBeenCalled();
    });
  });

  describe('retry', () => {
    it('repeats the last entered query at once, without the delay', async () => {
      const { controller, calls } = setup();

      controller.handleInput('spain');
      vi.advanceTimersByTime(DELAY);
      calls[0].reject(new TypeError('Failed to fetch'));
      await flushPromises();
      controller.retry();

      expect(calls.map((call) => call.query)).toEqual(['spain', 'spain']);
      expect(controller.getState()).toEqual({
        status: 'loading',
        query: 'spain',
      });
    });

    it('shows the result of the repeated request', async () => {
      const { controller, calls } = setup();
      const countries = [createCountry()];

      controller.handleInput('spain');
      vi.advanceTimersByTime(DELAY);
      calls[0].reject(new HttpError(503));
      await flushPromises();
      controller.retry();
      calls[1].resolve(countries);
      await flushPromises();

      expect(controller.getState()).toEqual({
        status: 'success',
        query: 'spain',
        countries,
      });
    });
  });

  describe('searchNow', () => {
    it('searches without the delay', () => {
      const { controller, calls } = setup();

      controller.searchNow('spain');

      expect(calls.map((call) => call.query)).toEqual(['spain']);
    });

    it('replaces a search that was still waiting for the delay', () => {
      const { controller, calls } = setup();

      controller.handleInput('fra');
      controller.searchNow('spain');
      vi.advanceTimersByTime(DELAY);

      expect(calls.map((call) => call.query)).toEqual(['spain']);
    });
  });
});
