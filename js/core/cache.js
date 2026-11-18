export const toCacheKey = (query) => query.trim().toLowerCase();
export const createCachedSearch = (search) => {
    const resolved = new Map();
    const inFlight = new Map();
    const forget = (key, request) => {
        if (inFlight.get(key) === request)
            inFlight.delete(key);
    };
    const startRequest = (key, query) => {
        const controller = new AbortController();
        const request = {
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
    const joinRequest = (key, request, signal) => new Promise((resolve, reject) => {
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
        if (signal.aborted)
            return Promise.reject(signal.reason);
        const key = toCacheKey(query);
        const cached = resolved.get(key);
        if (cached)
            return Promise.resolve(cached);
        const request = inFlight.get(key) ?? startRequest(key, query);
        return joinRequest(key, request, signal);
    };
};
//# sourceMappingURL=cache.js.map