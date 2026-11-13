import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import italy from './fixtures/italy.json';
import united from './fixtures/united.json';
import { createSearchController } from '../src/searchController.js';
import { mapCountryResponse } from '../src/countries/mapCountryResponse.js';

type PendingRequest = {
  url: string;
  signal: AbortSignal;
  respond: (body: unknown) => void;
};

const mockControlledFetch = () => {
  const requests: PendingRequest[] = [];

  vi.stubGlobal(
    'fetch',
    vi.fn(
      (url: string, init?: RequestInit) =>
        new Promise<Response>((resolve, reject) => {
          const signal = init?.signal;
          if (!signal) return;
          if (signal.aborted) {
            reject(signal.reason);
            return;
          }
          signal.addEventListener('abort', () => reject(signal.reason));
          requests.push({
            url,
            signal,
            respond: (body) => resolve(new Response(JSON.stringify(body), { status: 200 })),
          });
        }),
    ),
  );

  const requestFor = (query: string): PendingRequest => {
    const request = requests.find((item) => item.url.endsWith(`/${query}`));
    if (!request) throw new Error(`Request "${query}" has not been sent`);
    return request;
  };

  return { requestFor };
};

describe('searchController', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  test('показывает результат только последнего запроса, если первый ответ пришёл позже', async () => {
    const { requestFor } = mockControlledFetch();
    const controller = createSearchController({ debounceMs: 300 });

    controller.handleInput('i');
    await vi.advanceTimersByTimeAsync(300);
    controller.handleInput('italy');
    await vi.advanceTimersByTimeAsync(300);

    requestFor('italy').respond(italy);
    requestFor('i').respond(united);
    await vi.advanceTimersByTimeAsync(0);

    expect(controller.getState()).toEqual({
      status: 'success',
      countries: mapCountryResponse(italy),
    });
  });

  test('отменяет предыдущий запрос сразу при новом вводе, не дожидаясь debounce', async () => {
    const { requestFor } = mockControlledFetch();
    const controller = createSearchController({ debounceMs: 300 });

    controller.handleInput('i');
    await vi.advanceTimersByTimeAsync(300);
    controller.handleInput('it');

    expect(requestFor('i').signal.aborted).toBe(true);
  });

  test('не показывает ошибку, когда запрос отменён новым вводом', async () => {
    mockControlledFetch();
    const controller = createSearchController({ debounceMs: 300 });

    controller.handleInput('i');
    await vi.advanceTimersByTimeAsync(300);
    controller.handleInput('it');
    await vi.advanceTimersByTimeAsync(0);

    expect(controller.getState().status).not.toBe('error');
  });
});
