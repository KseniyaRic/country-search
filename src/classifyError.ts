import { HttpError } from './HttpError.js';

export type ErrorKind = 'aborted' | 'timeout' | 'http' | 'network' | 'unknown';

export function classifyError(error: unknown): ErrorKind {
  if (error instanceof HttpError) {
    return 'http';
  }
  if (error instanceof Error) {
    if (error.name === 'AbortError') {
      return 'aborted';
    }
    if (error.name === 'TimeoutError') {
      return 'timeout';
    }
    if (error instanceof TypeError) {
      return 'network';
    }
  }
  return 'unknown';
}
