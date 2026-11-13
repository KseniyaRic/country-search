import type { ErrorKind } from '../classifyError.js';

export const TEXTS = {
  TITLE: 'Country Atlas',
  DESCRIPTION: 'Start typing a country name — results appear as you type.',
  PLACEHOLDER: 'Type a country name…',
  LOADING: 'Loading…',
  NOT_FOUND: 'No results found. Try a different search.',
  RETRY: 'Retry',
  NO_INFO: 'No information',
} as const;

export const ERROR_MESSAGES: Record<ErrorKind, string> = {
  aborted: '',
  timeout: 'The server is taking too long to respond.',
  network: 'Network error. Please check your connection.',
  http: 'The server returned an error.',
  unknown: 'An error occurred while loading data.',
};
