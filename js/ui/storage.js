const HISTORY_KEY = 'country-search:history';
const isString = (value) => typeof value === 'string';
export const loadHistory = () => {
    try {
        const parsed = JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]');
        return Array.isArray(parsed) ? parsed.filter(isString) : [];
    }
    catch {
        return [];
    }
};
export const saveHistory = (history) => {
    try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
        return true;
    }
    catch {
        return false;
    }
};
//# sourceMappingURL=storage.js.map