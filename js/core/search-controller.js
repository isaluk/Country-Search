import { DEBOUNCE_DELAY_MS } from './constants.js';
import { debounce } from './debounce.js';
import { classifyError } from './errors.js';
const IDLE_STATE = { status: 'idle', query: '' };
const normalizeQuery = (text) => text.trim();
export const createSearchController = ({ search, onChange, delayMs = DEBOUNCE_DELAY_MS, }) => {
    let state = IDLE_STATE;
    let activeRequest = null;
    const setState = (next) => {
        state = next;
        onChange(state);
    };
    const runSearch = async (query) => {
        const request = new AbortController();
        activeRequest = request;
        try {
            const countries = await search(query, request.signal);
            setState(countries.length > 0
                ? { status: 'success', query, countries }
                : { status: 'empty', query });
        }
        catch (error) {
            const outcome = classifyError(error);
            if (outcome.kind === 'aborted')
                return;
            setState({ status: 'error', query, failure: outcome });
        }
    };
    const runSearchNow = (query) => {
        void runSearch(query);
    };
    const runSearchLater = debounce(runSearchNow, delayMs);
    const cancelPendingWork = () => {
        runSearchLater.cancel();
        activeRequest?.abort();
        activeRequest = null;
    };
    const startSearch = (text, launch) => {
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
//# sourceMappingURL=search-controller.js.map