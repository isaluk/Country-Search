import type { Country, RawCountry, RawCurrency } from './types.js';

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value !== '';

const formatCurrency = ({ name, code, symbol }: RawCurrency): string => {
  const title = name ?? code ?? '';
  const mark = symbol ?? code;

  return mark && mark !== title ? `${title} (${mark})` : title;
};

const mapCountry = (raw: RawCountry): Country => ({
  code: raw.alpha3Code,
  name: raw.name,
  nativeName: raw.nativeName ?? raw.name,
  flagUrl: raw.flags?.svg ?? raw.flags?.png ?? null,
  capital: raw.capital ?? null,
  region: raw.region ?? null,
  subregion: raw.subregion ?? null,
  population: raw.population ?? 0,
  area: raw.area ?? null,
  borders: raw.borders ?? [],
  languages: (raw.languages ?? [])
    .map((language) => language.name)
    .filter(isNonEmptyString),
  currencies: (raw.currencies ?? [])
    .map(formatCurrency)
    .filter(isNonEmptyString),
  demonym: raw.demonym ?? null,
});

export const mapCountryResponse = (raw: readonly RawCountry[]): Country[] =>
  raw.map(mapCountry);
