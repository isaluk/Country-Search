import type { Country, SearchFn } from './types.js';

interface InFlightRequest {
  readonly promise: Promise<readonly Country[]>;
  readonly controller: AbortController;
  waiting: number;
}

export const toCacheKey = (query: string): string => query.trim().toLowerCase();

export const createCachedSearch = (search: SearchFn): SearchFn => {
  const resolved = new Map<string, readonly Country[]>();
  const inFlight = new Map<string, InFlightRequest>();

  const forget = (key: string, request: InFlightRequest) => {
    if (inFlight.get(key) === request) inFlight.delete(key);
  };

  const startRequest = (key: string, query: string): InFlightRequest => {
    const controller = new AbortController();
    const request: InFlightRequest = {
      controller,
      waiting: 0,
      promise: search(query, controller.signal)
        .then((countries) => {
          resolved.set(key, countries);

          return countries;
        })
        .finally(() => forget(key, request)),
    };

    inFlight.set(key, request);

    return request;
  };

  const joinRequest = (
    key: string,
    request: InFlightRequest,
    signal: AbortSignal,
  ): Promise<readonly Country[]> =>
    new Promise((resolve, reject) => {
      const leave = () => {
        request.waiting -= 1;

        if (request.waiting === 0) {
          forget(key, request);
          request.controller.abort();
        }

        reject(signal.reason);
      };

      request.waiting += 1;
      signal.addEventListener('abort', leave, { once: true });
      request.promise
        .then(resolve, reject)
        .finally(() => signal.removeEventListener('abort', leave));
    });

  return (query, signal) => {
    if (signal.aborted) return Promise.reject(signal.reason);

    const key = toCacheKey(query);
    const cached = resolved.get(key);

    if (cached) return Promise.resolve(cached);

    const request = inFlight.get(key) ?? startRequest(key, query);

    return joinRequest(key, request, signal);
  };
};
