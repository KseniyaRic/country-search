export interface RawCountry {
  name: string;
  population: number;
  region: string;
  capital?: string;
  flags: {
    svg: string;
  };
  languages: { name: string }[];
  area?: number;
  borders?: string[];
  currencies?: { name: string; symbol?: string }[];
}

export interface CountryDetails {
  area: number | null;
  borders: string[];
  currencies: string[];
}

export interface CountryCard {
  name: string;
  flagUrl: string;
  capital: string | null;
  region: string;
  population: number;
  languages: string[];
}
