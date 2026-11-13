import { HttpError } from '../HttpError.js';
import type { RawCountry } from './types.js';

const BASE_URL = 'https://countries.dev/name/';
const DEFAULT_TIMEOUT_MS = 5000;
const NOT_FOUND_STATUS = 404;

export async function searchCountries(
  query: string,
  signal: AbortSignal,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<RawCountry[]> {
  const combinedSignal = AbortSignal.any([signal, AbortSignal.timeout(timeoutMs)]);
  const response = await fetch(BASE_URL + encodeURIComponent(query), { signal: combinedSignal });
  if (response.status === NOT_FOUND_STATUS) {
    return [];
  }
  if (!response.ok) {
    throw new HttpError(response.status, `Request failed with status ${response.status}`);
  }
  return response.json();
}
