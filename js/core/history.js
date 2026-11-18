import { HISTORY_LIMIT } from './constants.js';
const isPrefixOf = (text) => {
    const lowerText = text.toLowerCase();
    return (candidate) => lowerText.startsWith(candidate.toLowerCase());
};
export const addToHistory = (history, query, limit = HISTORY_LIMIT) => {
    const entry = query.trim();
    if (entry === '')
        return [...history];
    const isTypingStep = isPrefixOf(entry);
    const rest = history.filter((item) => !isTypingStep(item));
    return [entry, ...rest].slice(0, limit);
};
//# sourceMappingURL=history.js.map