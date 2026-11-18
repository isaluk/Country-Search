import { createElement } from './dom.js';
import { createIcon } from './icons.js';

const INPUT_ID = 'country-query';

interface SearchFormHandlers {
  readonly onInput: (text: string) => void;
  readonly onSubmit: (text: string) => void;
}

export interface SearchForm {
  readonly element: HTMLFormElement;
  readonly setValue: (text: string) => void;
}

export const createSearchForm = ({
  onInput,
  onSubmit,
}: SearchFormHandlers): SearchForm => {
  const input = createElement('input', {
    id: INPUT_ID,
    className: 'search__input',
    type: 'search',
    placeholder: 'Spain, united, new z…',
    autocomplete: 'off',
    spellcheck: false,
  });
  const label = createElement(
    'label',
    { className: 'visually-hidden', htmlFor: INPUT_ID },
    ['Country name'],
  );
  const submit = createElement(
    'button',
    { className: 'search__submit', type: 'submit', ariaLabel: 'Search' },
    [createIcon('arrowRight')],
  );
  const element = createElement(
    'form',
    { className: 'search', role: 'search' },
    [label, input, submit],
  );

  input.addEventListener('input', () => onInput(input.value));
  element.addEventListener('submit', (event) => {
    event.preventDefault();
    onSubmit(input.value);
  });

  return {
    element,
    setValue: (text) => {
      input.value = text;
      input.focus();
    },
  };
};
