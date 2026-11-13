import type { RawCountry } from './types.js';

export function searchCountries(query: string, signal: AbortSignal, timeoutMs = 5000): Promise<RawCountry[]> {
  void query;
  void signal;
  void timeoutMs;
  return Promise.reject(new Error('not implemented'));
}
