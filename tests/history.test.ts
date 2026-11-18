import { describe, expect, it } from 'vitest';
import { addToHistory } from '../src/core/history.js';

describe('addToHistory', () => {
  it('puts a new query first', () => {
    expect(addToHistory(['france'], 'spain')).toEqual(['spain', 'france']);
  });

  it('trims the query', () => {
    expect(addToHistory([], '  spain ')).toEqual(['spain']);
  });

  it('ignores an empty query', () => {
    expect(addToHistory(['france'], '   ')).toEqual(['france']);
  });

  it('moves a repeated query to the top instead of duplicating it', () => {
    expect(addToHistory(['france', 'spain', 'peru'], 'Spain')).toEqual([
      'Spain',
      'france',
      'peru',
    ]);
  });

  it('drops older entries that are typing steps of the new query', () => {
    expect(addToHistory(['sp', 'france', 's'], 'spain')).toEqual([
      'spain',
      'france',
    ]);
  });

  it('keeps a longer older query when a shorter one is searched', () => {
    expect(addToHistory(['spain'], 'sp')).toEqual(['sp', 'spain']);
  });

  it('keeps no more than the limit, dropping the oldest', () => {
    expect(addToHistory(['c', 'b', 'a'], 'd', 3)).toEqual(['d', 'c', 'b']);
  });

  it('returns a new array and leaves the old one untouched', () => {
    const history = ['france'];
    const next = addToHistory(history, 'spain');

    expect(next).not.toBe(history);
    expect(history).toEqual(['france']);
  });
});
