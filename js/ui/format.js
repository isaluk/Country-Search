const NO_DATA = '—';
const COMPACT_FROM = 1000;
const numberFormat = new Intl.NumberFormat('en-US');
const compactFormat = new Intl.NumberFormat('en-US', {
    notation: 'compact',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
});
export const formatNumber = (value) => numberFormat.format(value);
export const formatCompactNumber = (value) => value < COMPACT_FROM ? formatNumber(value) : compactFormat.format(value);
export const formatText = (value) => value ?? NO_DATA;
export const formatArea = (area) => area === null ? NO_DATA : `${formatNumber(area)} km²`;
export const formatList = (items, fallback = NO_DATA) => (items.length > 0 ? items.join(', ') : fallback);
export const formatRegion = ({ region, subregion }) => {
    const parts = [region, subregion].filter((part, index, all) => part !== null && all.indexOf(part) === index);
    return parts.length > 0 ? parts.join(' · ') : NO_DATA;
};
export const formatCount = (count) => String(count).padStart(2, '0');
export const formatCountLabel = (count, query) => `${count === 1 ? 'country' : 'countries'} found for “${query}”`;
export const describeCountry = (country) => {
    const { name, nativeName, subregion, region, capital, demonym } = country;
    const title = nativeName === name ? name : `${name} (${nativeName})`;
    const place = subregion ?? region;
    return [
        place ? `${title} is located in ${place}.` : `${title}.`,
        capital && `Its capital is ${capital}.`,
        demonym && `People who live here are called ${demonym}.`,
    ]
        .filter(Boolean)
        .join(' ');
};
export const describeFailureTitle = (failure) => {
    switch (failure.kind) {
        case 'timeout':
            return 'Too slow to answer';
        case 'http':
            return 'The server tripped';
        case 'network':
            return 'Lost the signal';
        case 'unknown':
            return 'Something went wrong';
    }
};
export const describeFailure = (failure) => {
    switch (failure.kind) {
        case 'timeout':
            return 'The server took too long to answer.';
        case 'http':
            return `The server answered with an error (code ${failure.status}).`;
        case 'network':
            return 'Check your connection, then try again.';
        case 'unknown':
            return 'An unexpected error happened.';
    }
};
//# sourceMappingURL=format.js.map