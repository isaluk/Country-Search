import { describe, expect, it } from 'vitest';
import { createCachedSearch } from '../src/core/cache.js';
import { HttpError } from '../src/core/errors.js';
import { createCountry } from './fixtures/countries.js';
import { createSearchStub } from './helpers/search-stub.js';

const SPAIN = [createCountry()];

const setup = () => {
  const stub = createSearchStub();

  return { ...stub, cachedSearch: createCachedSearch(stub.search) };
};

const newSignal = () => new AbortController().signal;

describe('createCachedSearch', () => {
  describe('cache', () => {
    it('answers a repeated query from the cache, without a new request', async () => {
      const { cachedSearch, search, calls } = setup();

      const first = cachedSearch('spain', newSignal());
      calls[0].resolve(SPAIN);
      await first;
      const second = await cachedSearch('spain', newSignal());

      expect(second).toBe(SPAIN);
      expect(search).toHaveBeenCalledTimes(1);
    });

    it('treats queries that differ only in case and outer spaces as the same', async () => {
      const { cachedSearch, search, calls } = setup();

      const first = cachedSearch('spain', newSignal());
      calls[0].resolve(SPAIN);
      await first;
      await cachedSearch('  SPAIN ', newSignal());

      expect(search).toHaveBeenCalledTimes(1);
    });

    it('caches an empty result too', async () => {
      const { cachedSearch, search, calls } = setup();

      const first = cachedSearch('qwerty', newSignal());
      calls[0].resolve([]);
      await first;

      await expect(cachedSearch('qwerty', newSignal())).resolves.toEqual([]);
      expect(search).toHaveBeenCalledTimes(1);
    });

    it('does not cache a failure: the next call goes to the network again', async () => {
      const { cachedSearch, search, calls } = setup();

      const first = cachedSearch('spain', newSignal());
      calls[0].reject(new HttpError(500));
      await expect(first).rejects.toBeInstanceOf(HttpError);

      const second = cachedSearch('spain', newSignal());
      calls[1].resolve(SPAIN);

      await expect(second).resolves.toBe(SPAIN);
      expect(search).toHaveBeenCalledTimes(2);
    });
  });

  describe('deduplication of in-flight requests', () => {
    it('shares one request between callers with the same query', async () => {
      const { cachedSearch, search, calls } = setup();

      const first = cachedSearch('spain', newSignal());
      const second = cachedSearch('spain', newSignal());
      calls[0].resolve(SPAIN);

      await expect(first).resolves.toBe(SPAIN);
      await expect(second).resolves.toBe(SPAIN);
      expect(search).toHaveBeenCalledTimes(1);
    });

    it('lets one caller cancel without breaking the other one', async () => {
      const { cachedSearch, calls } = setup();
      const impatient = new AbortController();

      const first = cachedSearch('spain', impatient.signal);
      const second = cachedSearch('spain', newSignal());
      impatient.abort();
      calls[0].resolve(SPAIN);

      await expect(first).rejects.toMatchObject({ name: 'AbortError' });
      await expect(second).resolves.toBe(SPAIN);
      expect(calls[0].signal.aborted).toBe(false);
    });

    it('aborts the real request when every caller has cancelled', async () => {
      const { cachedSearch, calls } = setup();
      const firstCaller = new AbortController();
      const secondCaller = new AbortController();

      const first = cachedSearch('spain', firstCaller.signal);
      const second = cachedSearch('spain', secondCaller.signal);
      firstCaller.abort();
      secondCaller.abort();

      await expect(first).rejects.toMatchObject({ name: 'AbortError' });
      await expect(second).rejects.toMatchObject({ name: 'AbortError' });
      expect(calls[0].signal.aborted).toBe(true);
    });

    it('starts a fresh request for a caller that comes after a full cancellation', async () => {
      const { cachedSearch, search, calls } = setup();
      const gone = new AbortController();

      const first = cachedSearch('spain', gone.signal);
      gone.abort();
      const second = cachedSearch('spain', newSignal());
      calls[1].resolve(SPAIN);

      await expect(first).rejects.toMatchObject({ name: 'AbortError' });
      await expect(second).resolves.toBe(SPAIN);
      expect(search).toHaveBeenCalledTimes(2);
    });

    it('rejects at once for an already aborted signal, without a request', async () => {
      const { cachedSearch, search } = setup();
      const controller = new AbortController();

      controller.abort();

      await expect(
        cachedSearch('spain', controller.signal),
      ).rejects.toMatchObject({ name: 'AbortError' });
      expect(search).not.toHaveBeenCalled();
    });
  });
});
