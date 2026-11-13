import type { CountryDetails, RawCountry } from './types.js';

export function mapCountryDetails(country: RawCountry): CountryDetails {
  return {
    area: country.area ?? null,
    borders: country.borders ?? [],
    currencies: (country.currencies ?? []).map(({ name, symbol }) => (symbol ? `${name} (${symbol})` : name)),
  };
}
