import { debounce } from './debounce.js';
import { classifyError, type ErrorKind } from './classifyError.js';
import { searchCountries } from './countries/searchCountries.js';
import { mapCountryResponse } from './countries/mapCountryResponse.js';
import { mapCountryDetails } from './countries/mapCountryDetails.js';
import type { CountryCard, CountryDetails, RawCountry } from './countries/types.js';

export type SearchState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; countries: CountryCard[] }
  | { status: 'empty' }
  | { status: 'error'; kind: ErrorKind };

export interface SearchController {
  handleInput: (text: string) => void;
  retry: () => void;
  getState: () => SearchState;
  getDetails: (name: string) => CountryDetails | undefined;
}

interface SearchControllerOptions {
  debounceMs: number;
  onStateChange?: (state: SearchState) => void;
}

export function createSearchController(options: SearchControllerOptions): SearchController {
  let state: SearchState = { status: 'idle' };
  let currentRequest: AbortController | null = null;
  let lastQuery = '';
  let loadedCountries: RawCountry[] = [];

  const setState = (next: SearchState): void => {
    state = next;
    options.onStateChange?.(state);
  };

  const runSearch = async (query: string): Promise<void> => {
    if (query === '') {
      setState({ status: 'idle' });
      return;
    }

    currentRequest?.abort();
    const requestController = new AbortController();
    currentRequest = requestController;
    setState({ status: 'loading' });

    try {
      loadedCountries = await searchCountries(query, requestController.signal);
      setState(
        loadedCountries.length === 0
          ? { status: 'empty' }
          : { status: 'success', countries: mapCountryResponse(loadedCountries) },
      );
    } catch (error) {
      const kind = classifyError(error);
      if (kind === 'aborted') {
        return;
      }
      setState({ status: 'error', kind });
    }
  };

  const debouncedSearch = debounce((query: string) => {
    void runSearch(query);
  }, options.debounceMs);

  const handleInput = (text: string): void => {
    currentRequest?.abort();
    const query = text.trim();
    if (query === '') {
      setState({ status: 'idle' });
    } else {
      lastQuery = query;
    }
    debouncedSearch(query);
  };

  const retry = (): void => {
    if (lastQuery !== '') {
      void runSearch(lastQuery);
    }
  };

  const getDetails = (name: string): CountryDetails | undefined => {
    const country = loadedCountries.find((item) => item.name === name);
    return country ? mapCountryDetails(country) : undefined;
  };

  return { handleInput, retry, getState: () => state, getDetails };
}
