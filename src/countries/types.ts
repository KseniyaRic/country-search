export interface RawCountry {
  name: string;
  population: number;
  region: string;
  capital?: string;
  flags: {
    svg: string;
  };
  languages: { name: string }[];
}

export interface CountryCard {
  name: string;
  flagUrl: string;
  capital: string | null;
  region: string;
  population: number;
  languages: string[];
}
