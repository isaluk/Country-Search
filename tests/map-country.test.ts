import { describe, expect, it } from 'vitest';
import { mapCountryResponse } from '../src/core/map-country.js';
import { RAW_ANTARCTICA, RAW_SPAIN } from './fixtures/raw-countries.js';

describe('mapCountryResponse', () => {
  it('maps a full API country to card data', () => {
    expect(mapCountryResponse([RAW_SPAIN])).toEqual([
      {
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
      },
    ]);
  });

  it('replaces missing capital, borders and currencies with null and empty lists', () => {
    const [antarctica] = mapCountryResponse([RAW_ANTARCTICA]);

    expect(antarctica.capital).toBeNull();
    expect(antarctica.borders).toEqual([]);
    expect(antarctica.currencies).toEqual([]);
    expect(antarctica.languages).toEqual(['English', 'Russian']);
  });

  it('fills every field even when the API sends only a name and a code', () => {
    expect(
      mapCountryResponse([{ name: 'Nowhere', alpha3Code: 'NWH' }]),
    ).toEqual([
      {
        code: 'NWH',
        name: 'Nowhere',
        nativeName: 'Nowhere',
        flagUrl: null,
        capital: null,
        region: null,
        subregion: null,
        population: 0,
        area: null,
        borders: [],
        languages: [],
        currencies: [],
        demonym: null,
      },
    ]);
  });

  it('uses the png flag when there is no svg one', () => {
    const [country] = mapCountryResponse([
      { ...RAW_SPAIN, flags: { png: 'https://flagcdn.com/w320/es.png' } },
    ]);

    expect(country.flagUrl).toBe('https://flagcdn.com/w320/es.png');
  });

  it('shows the currency code when the currency has no symbol', () => {
    const [country] = mapCountryResponse([
      { ...RAW_SPAIN, currencies: [{ code: 'EUR', name: 'Euro' }] },
    ]);

    expect(country.currencies).toEqual(['Euro (EUR)']);
  });

  it('skips languages and currencies without a name', () => {
    const [country] = mapCountryResponse([
      { ...RAW_SPAIN, languages: [{}, { name: 'Spanish' }], currencies: [{}] },
    ]);

    expect(country.languages).toEqual(['Spanish']);
    expect(country.currencies).toEqual([]);
  });

  it('keeps the order and the number of countries', () => {
    const names = mapCountryResponse([RAW_SPAIN, RAW_ANTARCTICA]).map(
      (country) => country.name,
    );

    expect(names).toEqual(['Spain', 'Antarctica']);
  });

  it('returns an empty list for an empty response', () => {
    expect(mapCountryResponse([])).toEqual([]);
  });

  it('does not change the API data', () => {
    const raw = structuredClone(RAW_SPAIN);

    mapCountryResponse([raw]);

    expect(raw).toEqual(RAW_SPAIN);
  });
});
