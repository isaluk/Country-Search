import { createElement } from './dom.js';
import { formatCompactNumber, formatText } from './format.js';
import { createIcon } from './icons.js';
export const createFlag = (country, className) => country.flagUrl
    ? createElement('img', {
        className,
        src: country.flagUrl,
        alt: `Flag of ${country.name}`,
        loading: 'lazy',
    })
    : createElement('span', { className: `${className} flag-placeholder` });
export const toRegionModifier = (region) => region ? region.toLowerCase().replace(/[^a-z]+/g, '-') : 'none';
export const createRegionPill = (region) => createElement('span', { className: `pill pill--${toRegionModifier(region)}` }, [formatText(region)]);
const createFact = (label, value) => createElement('span', { className: 'card__fact' }, [
    createElement('span', { className: 'card__label' }, [label]),
    createElement('span', { className: 'card__value' }, [value]),
]);
export const createCountryCard = (country, onOpen) => {
    const button = createElement('button', { className: 'card', type: 'button' }, [
        createFlag(country, 'card__flag'),
        createElement('span', { className: 'card__body' }, [
            createRegionPill(country.region),
            createElement('span', { className: 'card__name' }, [country.name]),
            createElement('span', { className: 'card__facts' }, [
                createFact('Capital', formatText(country.capital)),
                createFact('Population', formatCompactNumber(country.population)),
            ]),
        ]),
        createElement('span', { className: 'card__open' }, [
            createIcon('arrowUpRight'),
        ]),
    ]);
    button.addEventListener('click', () => onOpen(country));
    return createElement('li', { className: 'results__item' }, [button]);
};
//# sourceMappingURL=country-card.js.map