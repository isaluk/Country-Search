import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildSearchUrl, searchCountries } from '../src/core/api.js';
import { REQUEST_TIMEOUT_MS } from '../src/core/constants.js';
import { HttpError } from '../src/core/errors.js';
import { RAW_SPAIN } from './fixtures/raw-countries.js';
import { createFetchMock } from './helpers/fetch-mock.js';

describe('buildSearchUrl', () => {
  it('puts the query into the path of the name endpoint', () => {
    expect(buildSearchUrl('spain')).toBe('https://countries.dev/name/spain');
  });

  it('encodes spaces and special characters', () => {
    expect(buildSearchUrl('new zealand')).toBe(
      'https://countries.dev/name/new%20zealand',
    );
    expect(buildSearchUrl('a/b?c')).toBe(
      'https://countries.dev/name/a%2Fb%3Fc',
    );
  });
});

describe('searchCountries', () => {
  let mock: ReturnType<typeof createFetchMock>;

  beforeEach(() => {
    mock = createFetchMock();
    vi.stubGlobal('fetch', mock.fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('requests the name endpoint with the query', () => {
    void searchCountries('spain', new AbortController().signal);

    expect(mock.requests).toHaveLength(1);
    expect(mock.requests[0].url).toBe('https://countries.dev/name/spain');
  });

  it('resolves with mapped countries on a successful response', async () => {
    const promise = searchCountries('spain', new AbortController().signal);

    mock.requests[0].respond([RAW_SPAIN]);
    const countries = await promise;

    expect(countries).toHaveLength(1);
    expect(countries[0]).toMatchObject({ code: 'ESP', capital: 'Madrid' });
  });

  it('resolves with an empty list on 404: no matches is not an error', async () => {
    const promise = searchCountries('qwerty', new AbortController().signal);

    mock.requests[0].respond('Country not found', 404);

    await expect(promise).resolves.toEqual([]);
  });

  it('rejects with HttpError when the server answers 500', async () => {
    const promise = searchCountries('spain', new AbortController().signal);

    mock.requests[0].respond('Oops', 500);

    await expect(promise).rejects.toBeInstanceOf(HttpError);
    await expect(promise).rejects.toMatchObject({ status: 500 });
  });

  it('rejects with HttpError on other unsuccessful statuses too', async () => {
    const promise = searchCountries('spain', new AbortController().signal);

    mock.requests[0].respond('Too many requests', 429);

    await expect(promise).rejects.toMatchObject({
      name: 'HttpError',
      status: 429,
    });
  });

  it('rejects with AbortError when the caller aborts the request', async () => {
    const controller = new AbortController();
    const promise = searchCountries('spain', controller.signal);

    controller.abort();

    await expect(promise).rejects.toMatchObject({ name: 'AbortError' });
    expect(mock.requests[0].signal.aborted).toBe(true);
  });

  it('rejects with TimeoutError when the server is silent for too long', async () => {
    const timeout = new AbortController();
    const timeoutSpy = vi
      .spyOn(AbortSignal, 'timeout')
      .mockReturnValue(timeout.signal);
    const promise = searchCountries('spain', new AbortController().signal);

    timeout.abort(new DOMException('Timed out', 'TimeoutError'));

    await expect(promise).rejects.toMatchObject({ name: 'TimeoutError' });
    expect(timeoutSpy).toHaveBeenCalledWith(REQUEST_TIMEOUT_MS);
  });

  it('passes a network failure through as it is', async () => {
    const promise = searchCountries('spain', new AbortController().signal);

    mock.requests[0].fail(new TypeError('Failed to fetch'));

    await expect(promise).rejects.toBeInstanceOf(TypeError);
  });
});
