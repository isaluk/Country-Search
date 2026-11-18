export interface RawCountry {
  readonly name: string;
  readonly alpha3Code: string;
  readonly nativeName?: string;
  readonly flags?: { readonly svg?: string; readonly png?: string };
  readonly capital?: string;
  readonly region?: string;
  readonly subregion?: string;
  readonly population?: number;
  readonly area?: number;
  readonly borders?: readonly string[];
  readonly languages?: readonly RawLanguage[];
  readonly currencies?: readonly RawCurrency[];
  readonly demonym?: string;
}

export interface RawLanguage {
  readonly name?: string;
}

export interface RawCurrency {
  readonly code?: string;
  readonly name?: string;
  readonly symbol?: string;
}

export interface Country {
  readonly code: string;
  readonly name: string;
  readonly nativeName: string;
  readonly flagUrl: string | null;
  readonly capital: string | null;
  readonly region: string | null;
  readonly subregion: string | null;
  readonly population: number;
  readonly area: number | null;
  readonly borders: readonly string[];
  readonly languages: readonly string[];
  readonly currencies: readonly string[];
  readonly demonym: string | null;
}
