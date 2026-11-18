import { createFlag } from './country-card.js';
import { createElement } from './dom.js';
import { describeCountry, formatArea, formatList, formatNumber, formatRegion, formatText, } from './format.js';
import { createIcon } from './icons.js';
const TITLE_ID = 'details-title';
const createRow = (term, value) => createElement('div', { className: 'details__row' }, [
    createElement('dt', { className: 'details__term' }, [term]),
    createElement('dd', { className: 'details__value' }, [value]),
]);
const createBorders = (borders) => createElement('div', { className: 'details__borders' }, [
    createElement('h3', { className: 'details__term' }, ['Borders']),
    borders.length > 0
        ? createElement('ul', { className: 'details__chips' }, borders.map((code) => createElement('li', { className: 'chip chip--static' }, [code])))
        : createElement('p', { className: 'details__value' }, [
            'No land borders',
        ]),
]);
const createInfo = (country) => createElement('div', { className: 'details__info' }, [
    createElement('p', { className: 'details__region' }, [
        formatRegion(country),
    ]),
    createElement('h2', { className: 'details__name', id: TITLE_ID }, [
        country.name,
    ]),
    createElement('p', { className: 'details__description' }, [
        describeCountry(country),
    ]),
    createElement('dl', { className: 'details__facts' }, [
        createRow('Capital', formatText(country.capital)),
        createRow('Population', formatNumber(country.population)),
        createRow('Area', formatArea(country.area)),
        createRow('Languages', formatList(country.languages)),
        createRow('Currencies', formatList(country.currencies)),
        createRow('Region', formatText(country.region)),
    ]),
    createBorders(country.borders),
]);
const createVisual = (country, onClose) => {
    const closeButton = createElement('button', { className: 'details__close', type: 'button', ariaLabel: 'Close' }, [createIcon('close')]);
    closeButton.addEventListener('click', onClose);
    return createElement('div', { className: 'details__visual' }, [
        createElement('span', { className: 'details__code', ariaHidden: 'true' }, [
            country.code,
        ]),
        closeButton,
        createElement('div', { className: 'arch arch--flag' }, [
            createFlag(country, 'details__flag'),
        ]),
    ]);
};
export const createDetailsDialog = () => {
    const element = createElement('dialog', { className: 'details' });
    const close = () => element.close();
    element.setAttribute('aria-labelledby', TITLE_ID);
    element.addEventListener('click', (event) => {
        if (event.target === element)
            close();
    });
    return {
        element,
        open: (country) => {
            element.replaceChildren(createElement('article', { className: 'details__content' }, [
                createInfo(country),
                createVisual(country, close),
            ]));
            element.showModal();
        },
    };
};
//# sourceMappingURL=details-view.js.map