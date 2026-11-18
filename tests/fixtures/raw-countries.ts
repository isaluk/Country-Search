import type { RawCountry } from '../../src/core/types.js';

export const RAW_SPAIN: RawCountry = {
  name: 'Spain',
  nativeName: 'España',
  alpha3Code: 'ESP',
  flags: {
    png: 'https://flagcdn.com/w320/es.png',
    svg: 'https://flagcdn.com/es.svg',
  },
  capital: 'Madrid',
  region: 'Europe',
  subregion: 'Southern Europe',
  population: 47351567,
  area: 505992,
  borders: ['AND', 'FRA', 'GIB', 'PRT', 'MAR'],
  languages: [{ name: 'Spanish' }],
  currencies: [{ code: 'EUR', name: 'Euro', symbol: '€' }],
  demonym: 'Spanish',
};

export const RAW_ANTARCTICA: RawCountry = {
  name: 'Antarctica',
  nativeName: 'Antarctica',
  alpha3Code: 'ATA',
  flags: {
    png: 'https://flagcdn.com/w320/aq.png',
    svg: 'https://flagcdn.com/aq.svg',
  },
  region: 'Polar',
  subregion: 'Antarctica',
  population: 1000,
  area: 14000000,
  languages: [{ name: 'English' }, { name: 'Russian' }],
  demonym: 'Antarctic',
};
