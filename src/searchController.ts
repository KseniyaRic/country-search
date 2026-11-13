import { debounce } from './debounce.js';
import { classifyError } from './classifyError.js';
import { searchCountries } from './countries/searchCountries.js';
import { mapCountryResponse } from './countries/mapCountryResponse.js';
import { CountryCard } from './countries/types.js';
import { ErrorKind } from './classifyError.js';

export type SearchState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; countries: CountryCard[] }
  | { status: 'empty' }
  | { status: 'error'; kind: ErrorKind };

export interface SearchController {
  handleInput: (text: string) => void;
  getState: () => SearchState;
}

export function createSearchController(options: { debounceMs: number }): SearchController {
  let state: SearchState = { status: 'idle' };
  let currentRequest: AbortController | null = null;

  const runSearch = async (query: string): Promise<void> => {
    if (query === '') {
      state = { status: 'idle' };
      return;
    }

    const requestController = new AbortController();
    currentRequest = requestController;
    state = { status: 'loading' };

    try {
      const rawCountries = await searchCountries(query, requestController.signal);
      state =
        rawCountries.length === 0
          ? { status: 'empty' }
          : { status: 'success', countries: mapCountryResponse(rawCountries) };
    } catch (error) {
      const kind = classifyError(error);
      if (kind === 'aborted') {
        return;
      }
      state = { status: 'error', kind };
    }
  };

  const debouncedSearch = debounce((query: string) => {
    void runSearch(query);
  }, options.debounceMs);

  const handleInput = (text: string): void => {
    currentRequest?.abort();
    const query = text.trim();
    if (query === '') {
      state = { status: 'idle' };
    }
    debouncedSearch(query);
  };

  return {
    handleInput,
    getState: () => state,
  };
}
