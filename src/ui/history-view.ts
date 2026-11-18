import { createElement } from './dom.js';

interface HistoryHandlers {
  readonly onSelect: (query: string) => void;
  readonly onClear: () => void;
}

export const createHistoryView = (
  history: readonly string[],
  { onSelect, onClear }: HistoryHandlers,
): HTMLElement | null => {
  if (history.length === 0) return null;

  const items = history.map((query) => {
    const chip = createElement(
      'button',
      { className: 'chip chip--light', type: 'button' },
      [query],
    );

    chip.addEventListener('click', () => onSelect(query));

    return createElement('li', { className: 'history__item' }, [chip]);
  });
  const clearButton = createElement(
    'button',
    { className: 'history__clear', type: 'button' },
    ['Clear'],
  );

  clearButton.addEventListener('click', onClear);

  return createElement('div', { className: 'history__row' }, [
    createElement('h2', { className: 'history__title' }, ['Recent searches']),
    createElement('ul', { className: 'history__list' }, items),
    clearButton,
  ]);
};
