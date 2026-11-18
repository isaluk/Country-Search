const isNonEmptyString = (value) => typeof value === 'string' && value !== '';
const formatCurrency = ({ name, code, symbol }) => {
    const title = name ?? code ?? '';
    const mark = symbol ?? code;
    return mark && mark !== title ? `${title} (${mark})` : title;
};
const mapCountry = (raw) => ({
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
export const mapCountryResponse = (raw) => raw.map(mapCountry);
//# sourceMappingURL=map-country.js.map