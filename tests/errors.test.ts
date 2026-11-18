import { describe, expect, it } from 'vitest';
import {
  classifyError,
  HttpError,
  isAbortError,
  isTimeoutError,
} from '../src/core/errors.js';

const createAbortError = () => new DOMException('Aborted', 'AbortError');
const createTimeoutError = () => new DOMException('Timed out', 'TimeoutError');

describe('HttpError', () => {
  it('is a real Error that can be caught as usual', () => {
    expect(new HttpError(500)).toBeInstanceOf(Error);
  });

  it('keeps the response status', () => {
    expect(new HttpError(503).status).toBe(503);
  });

  it('has its own name and a readable message', () => {
    const error = new HttpError(500, 'Internal Server Error');

    expect(error.name).toBe('HttpError');
    expect(error.message).toBe('HTTP 500 Internal Server Error');
  });
});

describe('isAbortError / isTimeoutError', () => {
  it('recognises the reason of a real AbortController.abort()', () => {
    const controller = new AbortController();

    controller.abort();

    expect(isAbortError(controller.signal.reason)).toBe(true);
  });

  it('does not mix up a timeout with a cancellation', () => {
    expect(isAbortError(createTimeoutError())).toBe(false);
    expect(isTimeoutError(createAbortError())).toBe(false);
    expect(isTimeoutError(createTimeoutError())).toBe(true);
  });

  it('survives values that are not errors', () => {
    expect(isAbortError('AbortError')).toBe(false);
    expect(isTimeoutError(null)).toBe(false);
  });
});

describe('classifyError', () => {
  it('treats our own cancellation as "aborted", not as a failure', () => {
    expect(classifyError(createAbortError())).toEqual({ kind: 'aborted' });
  });

  it('treats a timeout as a failure of its own kind', () => {
    expect(classifyError(createTimeoutError())).toEqual({ kind: 'timeout' });
  });

  it('keeps the status of an HttpError', () => {
    expect(classifyError(new HttpError(500))).toEqual({
      kind: 'http',
      status: 500,
    });
  });

  it('treats a TypeError from fetch as a network failure', () => {
    expect(classifyError(new TypeError('Failed to fetch'))).toEqual({
      kind: 'network',
    });
  });

  it('falls back to "unknown" for anything else', () => {
    expect(classifyError(new SyntaxError('Unexpected token'))).toEqual({
      kind: 'unknown',
    });
    expect(classifyError('boom')).toEqual({ kind: 'unknown' });
  });
});
