import type { SearchState } from '../core/search-controller.js';
import type { Country } from '../core/types.js';
import { createCountryCard } from './country-card.js';
import { createElement } from './dom.js';
import {
  describeFailure,
  describeFailureTitle,
  formatCount,
  formatCountLabel,
} from './format.js';
import { createIcon } from './icons.js';

const SUGGESTIONS = ['spain', 'japan', 'peru'];
const SKELETON_CARDS = 4;

interface ResultsHandlers {
  readonly onRetry: () => void;
  readonly onOpen: (country: Country) => void;
  readonly onSuggest: (text: string) => void;
}

const createState = (
  modifier: string,
  children: readonly (Node | null)[],
): HTMLElement =>
  createElement('div', { className: `state state--${modifier}` }, children);

const createTitle = (...parts: readonly (Node | string)[]): HTMLElement =>
  createElement('h2', { className: 'state__title' }, parts);

const createMark = (text: string): HTMLElement =>
  createElement('mark', { className: 'mark' }, [text]);

const createText = (lines: readonly string[]): HTMLElement =>
  createElement(
    'p',
    { className: 'state__text' },
    lines.flatMap((line, index) =>
      index === 0 ? [line] : [createElement('br'), line],
    ),
  );

const createBadge = (symbol: string): HTMLElement =>
  createElement('span', { className: 'state__badge', ariaHidden: 'true' }, [
    symbol,
  ]);

const createIdle = (): HTMLElement =>
  createState('idle', [
    createElement('div', { className: 'arch', ariaHidden: 'true' }),
    createTitle('Where to?'),
    createText([
      'Type a country name or a part of it.',
      'Results appear while you type.',
    ]),
  ]);

const createLoading = (query: string): HTMLElement => {
  const loading = createState('loading', [
    createElement(
      'span',
      { className: 'dots', ariaHidden: 'true' },
      [1, 2, 3].map(() => createElement('span', { className: 'dots__dot' })),
    ),
    createTitle('Searching ', createMark(`“${query}”`)),
    createElement(
      'ul',
      {
        className: 'results__list results__list--skeleton',
        ariaHidden: 'true',
      },
      Array.from({ length: SKELETON_CARDS }, () =>
        createElement('li', { className: 'skeleton' }),
      ),
    ),
  ]);

  loading.role = 'status';

  return loading;
};

const createSuggestion = (
  text: string,
  onSuggest: (text: string) => void,
): HTMLButtonElement => {
  const button = createElement(
    'button',
    { className: 'chip', type: 'button' },
    [text],
  );

  button.addEventListener('click', () => onSuggest(text));

  return button;
};

const createEmpty = (
  query: string,
  onSuggest: (text: string) => void,
): HTMLElement =>
  createState('empty', [
    createBadge('?'),
    createTitle(`No match for “${query}”`),
    createText([
      'Nothing is broken, the world just has no such country.',
      'Check the spelling or try a shorter part of the name.',
    ]),
    createElement('div', { className: 'state__suggestions' }, [
      createElement('span', { className: 'state__hint' }, ['Try:']),
      ...SUGGESTIONS.map((text) => createSuggestion(text, onSuggest)),
    ]),
  ]);

const createRetryButton = (onRetry: () => void): HTMLButtonElement => {
  const button = createElement(
    'button',
    { className: 'button button--pink', type: 'button' },
    [createIcon('retry'), 'Try again'],
  );

  button.addEventListener('click', onRetry);

  return button;
};

const createError = (
  state: Extract<SearchState, { status: 'error' }>,
  onRetry: () => void,
): HTMLElement => {
  const error = createState('error', [
    createBadge('!'),
    createTitle(describeFailureTitle(state.failure)),
    createText([
      `Could not load results for “${state.query}”.`,
      describeFailure(state.failure),
    ]),
    createRetryButton(onRetry),
  ]);

  error.role = 'alert';

  return error;
};

const createSuccess = (
  state: Extract<SearchState, { status: 'success' }>,
  onOpen: (country: Country) => void,
): HTMLElement => {
  const count = state.countries.length;

  return createElement('div', { className: 'results__content' }, [
    createElement('div', { className: 'results__intro' }, [
      createElement('p', { className: 'results__count' }, [
        createElement('span', { className: 'results__eyebrow' }, [
          'Search results',
        ]),
        createElement('span', { className: 'results__number' }, [
          formatCount(count),
        ]),
        createElement('span', { className: 'results__caption' }, [
          formatCountLabel(count, state.query),
        ]),
      ]),
      createElement('p', { className: 'results__statement' }, [
        'We found ',
        createMark(
          `${count} ${count === 1 ? 'country' : 'countries'} hiding “${state.query}”`,
        ),
        ' in their names. Open any card to see its ',
        createMark('borders, languages and money.'),
      ]),
    ]),
    createElement(
      'ul',
      { className: 'results__list' },
      state.countries.map((country) => createCountryCard(country, onOpen)),
    ),
  ]);
};

export const createResultsView = (
  state: SearchState,
  { onRetry, onOpen, onSuggest }: ResultsHandlers,
): HTMLElement => {
  switch (state.status) {
    case 'idle':
      return createIdle();
    case 'loading':
      return createLoading(state.query);
    case 'empty':
      return createEmpty(state.query, onSuggest);
    case 'error':
      return createError(state, onRetry);
    case 'success':
      return createSuccess(state, onOpen);
  }
};
