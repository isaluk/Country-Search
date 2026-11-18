import { searchCountries } from './core/api.js';
import {
  createSearchController,
  type SearchState,
} from './core/search-controller.js';
import type { Country } from './core/types.js';
import { createElement } from './ui/dom.js';
import { createIcon } from './ui/icons.js';
import { createResultsView } from './ui/results-view.js';
import { createSearchForm } from './ui/search-view.js';

const STEPS = [
  ['01', 'Type', 'Results arrive while you type.'],
  [
    '02',
    'Pause',
    'After 350 ms we ask the server. Older questions are cancelled.',
  ],
  ['03', 'Open', 'Tap a card for borders, languages and money.'],
] as const;

const resultsRegion = createElement('section', {
  id: 'results',
  className: 'results',
  ariaLabel: 'Search results',
  ariaLive: 'polite',
});

const openDetails = (_country: Country) => {};

const renderResults = (state: SearchState) => {
  resultsRegion.ariaBusy = String(state.status === 'loading');
  resultsRegion.replaceChildren(
    createResultsView(state, {
      onRetry: () => controller.retry(),
      onOpen: openDetails,
      onSuggest: (text) => {
        searchForm.setValue(text);
        controller.searchNow(text);
      },
    }),
  );
};

const controller = createSearchController({
  search: searchCountries,
  onChange: renderResults,
});

const searchForm = createSearchForm({
  onInput: controller.handleInput,
  onSubmit: controller.searchNow,
});

const createHero = (): HTMLElement =>
  createElement('header', { className: 'hero' }, [
    createElement('div', { className: 'hero__bar' }, [
      createElement('a', { className: 'logo', href: './' }, [
        'Country ',
        createElement('span', { className: 'logo__accent' }, ['Search']),
      ]),
      createElement('span', { className: 'badge' }, [
        createElement('span', { className: 'badge__dot', ariaHidden: 'true' }),
        'Live data from countries.dev',
      ]),
    ]),
    createElement('h1', { className: 'hero__title' }, [
      createElement('span', { className: 'hero__word' }, ['Country']),
      ' ',
      createElement('span', { className: 'hero__word hero__word--accent' }, [
        'Search',
      ]),
    ]),
    createElement('div', { className: 'hero__balloon', ariaHidden: 'true' }),
    createElement('div', { className: 'hero__copy' }, [
      createElement('p', { className: 'hero__tagline' }, [
        'Type a name. ',
        createElement('span', { className: 'hero__highlight' }, [
          'Watch the world',
        ]),
        ' answer.',
      ]),
      createElement('p', { className: 'hero__text' }, [
        'Live search over 250 countries and territories. Old answers are cancelled before they can land on the screen.',
      ]),
      searchForm.element,
    ]),
    createElement('p', { className: 'hero__stat' }, [
      createElement('span', { className: 'hero__stat-number' }, ['250+']),
      createElement('span', { className: 'hero__stat-text' }, [
        'countries & territories in one search box',
      ]),
    ]),
  ]);

const createSheet = (): HTMLElement =>
  createElement('main', { className: 'sheet' }, [
    createElement('div', { className: 'sheet__top' }, [
      createElement('span', { className: 'sheet__label' }, ['Results']),
      createElement(
        'a',
        {
          className: 'sheet__jump',
          href: '#results',
          ariaLabel: 'Jump to results',
        },
        [createIcon('arrowDown')],
      ),
    ]),
    resultsRegion,
  ]);

const createHowItWorks = (): HTMLElement =>
  createElement('footer', { className: 'how' }, [
    createElement('div', { className: 'how__info' }, [
      createElement('h2', { className: 'how__title' }, ['How it works']),
      createElement(
        'ol',
        { className: 'how__steps' },
        STEPS.map(([number, title, text]) =>
          createElement('li', { className: 'how__step' }, [
            createElement('span', { className: 'how__number' }, [number]),
            createElement('span', { className: 'how__name' }, [title]),
            createElement('span', { className: 'how__text' }, [text]),
          ]),
        ),
      ),
    ]),
    createElement('div', { className: 'how__panel' }, [
      createElement('p', { className: 'how__slogan' }, [
        'The world is one query away',
      ]),
      createElement('div', {
        className: 'arch arch--small',
        ariaHidden: 'true',
      }),
    ]),
  ]);

document.body.append(createHero(), createSheet(), createHowItWorks());

renderResults(controller.getState());
