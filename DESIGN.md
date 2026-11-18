# Country Search — design notes

Live search over `GET https://countries.dev/name/{query}`. The logic lives in `src/core` and does not touch the DOM; `src/ui` and `src/main.ts` only draw the state.

## 1. Cancelling stale requests

### How it works

1. `createSearchController` (`src/core/search-controller.ts`) keeps one `AbortController` for the request that is in flight (`activeRequest`).
2. **Every** input change calls `startSearch` → `cancelPendingWork`. It does two things at once: drops the debounce timer (`runSearchLater.cancel()`) and calls `activeRequest.abort()`. This happens at the moment of the keystroke, not when the debounce timer fires.
3. `runSearch` creates a fresh `AbortController` and passes its `signal` to the search function. In the app it is `createCachedSearch(searchCountries)`.
4. `searchCountries` (`src/core/api.ts`) merges this signal with a timeout: `AbortSignal.any([signal, AbortSignal.timeout(REQUEST_TIMEOUT_MS)])` and gives the result to `fetch`.
5. An aborted `fetch` rejects its promise. `classifyError` (`src/core/errors.ts`) looks at the error name:

| What happened            | Error                               | `classifyError` | What the user sees               |
| ------------------------ | ----------------------------------- | --------------- | -------------------------------- |
| We cancelled the request | `DOMException`, name `AbortError`   | `aborted`       | nothing, `runSearch` ends        |
| No answer for 8 s        | `DOMException`, name `TimeoutError` | `timeout`       | "Too slow to answer" + Try again |
| Status 500, 429, …       | `HttpError` with `status`           | `http`          | "The server tripped" + Try again |
| No network, DNS, CORS    | `TypeError`                         | `network`       | "Lost the signal" + Try again    |
| Status 404               | no error, `searchCountries` → `[]`  | —               | neutral "No match for …"         |

### Why abort and not an "is this answer still actual" flag

- **A flag only hides the answer, the request keeps running.** The browser still downloads and parses a response nobody needs, and the server still does the work. With `abort()` the connection is closed; DevTools shows the request as `canceled`.
- **A flag has to be checked in every place that touches the result.** One forgotten check and a stale response is on the screen again. With `abort()` the promise is rejected, so the code after `await` simply does not run for a stale request: the wrong path does not exist.
- **The gap during the debounce pause.** If we aborted only when the next request starts, the old response could arrive during the 350 ms pause and be drawn under the new text. That is why the abort happens on input, before the pause.
- **One mechanism for three cases.** New input, cleared input and timeout are all "a signal was aborted"; the reason tells them apart.

The race itself is covered by `tests/race.test.ts`: the mocked `fetch` rejects with `signal.reason` on abort, the earlier request answers after the later one, and the final state must contain only the later result. With the `abort()` line removed this test fails.

### Cancellation and the cache

`createCachedSearch` (`src/core/cache.ts`) shares one real request between callers with the same query. The shared request has its own `AbortController`, and every caller gets a personal wrapper (`joinRequest`):

- one caller aborts → only its wrapper rejects with `AbortError`, the others still get the result;
- every caller aborted → the real request is aborted too, so stale requests are still `canceled` in DevTools.

Failures are not cached, so "Try again" always goes to the network.

## 2. Debounce delay: 350 ms

`DEBOUNCE_DELAY_MS = 350` (`src/core/constants.ts`), `debounce` is in `src/core/debounce.ts`.

- A person types a word with 100–250 ms between keys. A pause longer than 350 ms usually means "I have finished this part", so one word produces one request.
- **Without debounce** every keystroke sends a request: `spain` is 5 requests, 4 of them are aborted at once. It works, but wastes traffic and can hit the rate limit of a free API.
- **With a much longer delay (1 s and more)** the interface feels frozen: the answer comes not earlier than delay + network time after the last key.
- The loading state appears at the first keystroke, not after the pause, so the delay is felt as part of loading.
- Enter, a click on a recent search and a click on a suggestion call `searchNow`, which skips the pause: the user has clearly finished typing.

## 3. Complexity

`n` — countries in the response, `q` — length of the query, `h` — history length (at most 8).

| Function                          | Time   | Memory | Why                                                                                                                                  |
| --------------------------------- | ------ | ------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| `mapCountryResponse`              | O(n)   | O(n)   | one `map` over the countries; inside, `map`/`filter` over languages and currencies of one country, which are a few items, a constant |
| `debounce` (one call)             | O(1)   | O(1)   | `clearTimeout` + `setTimeout`                                                                                                        |
| cache hit in `createCachedSearch` | O(q)   | —      | `toCacheKey` walks the query once, `Map.get` is O(1) on average                                                                      |
| joining an in-flight request      | O(q)   | O(1)   | the same key lookup in the second `Map`, plus one listener                                                                           |
| cache as a whole                  | —      | O(k·n) | `k` different queries, each stores its mapped list; nothing is evicted, the cache lives until the page is closed                     |
| `addToHistory`                    | O(h·q) | O(h)   | one `filter` over the history, `startsWith` on each item                                                                             |
| `createResultsView` (success)     | O(n)   | O(n)   | one card per country                                                                                                                 |

Strictly, `mapCountryResponse` is O(n·(l + c)) where `l` and `c` are languages and currencies per country. Both are bounded by small numbers in the data, so the growth is linear in `n`.

## 4. Clean code principles

| Principle                             | Where                                                                                                                                                              |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Single responsibility                 | `debounce.ts` only delays, `api.ts` only talks HTTP, `map-country.ts` only converts data, `errors.ts` only classifies, `search-controller.ts` only holds the state |
| Functional core, imperative shell     | `src/core/*` has no `document` and no `localStorage`; DOM is in `src/ui/*`, storage in `src/ui/storage.ts`                                                         |
| Dependency injection                  | `createSearchController({ search })` receives the search function; tests pass a stub, the app passes `createCachedSearch(searchCountries)`                         |
| Open/closed                           | caching was added as a wrapper `createCachedSearch(search)` with the same `SearchFn` type; `api.ts` and the controller were not changed                            |
| No magic values                       | `DEBOUNCE_DELAY_MS`, `REQUEST_TIMEOUT_MS`, `HTTP_NOT_FOUND`, `HISTORY_LIMIT` in `src/core/constants.ts`                                                            |
| Impossible states are unrepresentable | `SearchState` in `search-controller.ts` is a discriminated union: `countries` exist only in `success`, `failure` only in `error`                                   |
| Exhaustive `switch` instead of flags  | `createResultsView` in `src/ui/results-view.ts`, `describeFailure` and `describeFailureTitle` in `src/ui/format.ts`: a new state will not compile until handled    |
| Names that explain intent             | `cancelPendingWork`, `runSearchLater`, `runSearchNow` (`search-controller.ts`), `isTypingStep` (`history.ts`), `joinRequest` (`cache.ts`)                          |
| DRY                                   | `startSearch` is shared by `handleInput`, `searchNow` and `retry`; `createElement` (`src/ui/dom.ts`) and `createState` (`results-view.ts`) build all markup        |
| Errors are never silently swallowed   | the only ignored search outcome is `aborted` in `runSearch`; storage failures in `storage.ts` fall back to an empty history and `saveHistory` reports `false`      |
| Immutability                          | `readonly` fields in `src/core/types.ts`; `addToHistory` returns a new array; `mapCountryResponse` does not change the API data                                    |
| Guard clauses                         | early `return` in `searchCountries` (404, `!response.ok`) and in `startSearch` (empty query)                                                                       |
| Safe DOM                              | no `innerHTML`: text from the API goes into `createElement` as text nodes, icons are built with `createElementNS` (`src/ui/icons.ts`)                              |
