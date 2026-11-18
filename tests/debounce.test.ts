import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { debounce } from '../src/core/debounce.js';

const DELAY = 300;

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not call the function before the delay has passed', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, DELAY);

    debounced();
    vi.advanceTimersByTime(DELAY - 1);

    expect(fn).not.toHaveBeenCalled();
  });

  it('calls the function once when the delay has passed', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, DELAY);

    debounced();
    vi.advanceTimersByTime(DELAY);

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('restarts the timer when called again during the delay', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, DELAY);

    debounced();
    vi.advanceTimersByTime(DELAY - 1);
    debounced();
    vi.advanceTimersByTime(DELAY - 1);

    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('passes the arguments of the last call only', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, DELAY);

    debounced('s');
    debounced('sp');
    debounced('spain');
    vi.advanceTimersByTime(DELAY);

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('spain');
  });

  it('fires again for a call made after the previous one has fired', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, DELAY);

    debounced('first');
    vi.advanceTimersByTime(DELAY);
    debounced('second');
    vi.advanceTimersByTime(DELAY);

    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenLastCalledWith('second');
  });

  it('drops the pending call on cancel()', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, DELAY);

    debounced();
    debounced.cancel();
    vi.advanceTimersByTime(DELAY);

    expect(fn).not.toHaveBeenCalled();
  });

  it('keeps an independent timer for every debounced function', () => {
    const first = vi.fn();
    const second = vi.fn();
    const debouncedFirst = debounce(first, DELAY);
    const debouncedSecond = debounce(second, DELAY * 2);

    debouncedFirst();
    debouncedSecond();
    vi.advanceTimersByTime(DELAY);

    expect(first).toHaveBeenCalledTimes(1);
    expect(second).not.toHaveBeenCalled();
  });
});
