import type { CountryCard, RawCountry } from './types.js';

function createCountryCard(country: RawCountry): CountryCard {
  return {
    name: country.name,
    flagUrl: country.flags.svg,
    capital: country.capital ?? null,
    region: country.region,
    population: country.population,
    languages: country.languages.map((language) => language.name),
  };
}

export function mapCountryResponse(raw: RawCountry[]): CountryCard[] {
  return raw.map(createCountryCard);
}
