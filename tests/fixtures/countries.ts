import type { Country } from '../../src/core/types.js';

export const createCountry = (overrides: Partial<Country> = {}): Country => ({
  code: 'ESP',
  name: 'Spain',
  nativeName: 'España',
  flagUrl: 'https://flagcdn.com/es.svg',
  capital: 'Madrid',
  region: 'Europe',
  subregion: 'Southern Europe',
  population: 47351567,
  area: 505992,
  borders: ['AND', 'FRA', 'GIB', 'PRT', 'MAR'],
  languages: ['Spanish'],
  currencies: ['Euro (€)'],
  demonym: 'Spanish',
  ...overrides,
});
