export interface RawLanguage {
  name: string;
  iso639_1?: string;
}

export interface RawCountry {
  name: string;
  population: number;
  region: string;
  capital?: string;
  flags?: {
    svg?: string;
    png?: string;
  };
  languages?: RawLanguage[];
}

export interface CountryCard {
  name: string;
  flagUrl: string | null;
  capital: string | null;
  region: string;
  population: number;
  languages: string[];
}
