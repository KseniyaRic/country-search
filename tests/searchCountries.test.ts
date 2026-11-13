import { describe, test, expect, vi } from 'vitest';
import italy from './fixtures/italy.json';
import { HttpError } from '../src/HttpError.js';
import { searchCountries } from '../src/countries/searchCountries.js';

const mockFetch = (response: Response) => {
  const fetchMock = vi.fn().mockResolvedValue(response);
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
};

const mockHangingFetch = () => {
  const fetchMock = vi.fn(
    (_url: unknown, init?: RequestInit) =>
      new Promise<Response>((_resolve, reject) => {
        const signal = init?.signal;
        if (!signal) return;
        if (signal.aborted) {
          reject(signal.reason);
          return;
        }
        signal.addEventListener('abort', () => reject(signal.reason));
      }),
  );
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
};

describe('searchCountries', () => {
  test('возвращает массив стран из ответа с кодом 200', async () => {
    mockFetch(new Response(JSON.stringify(italy), { status: 200 }));

    const countries = await searchCountries('italy', new AbortController().signal);

    expect(countries).toEqual(italy);
  });

  test('возвращает пустой массив, если сервер ответил кодом 404', async () => {
    mockFetch(new Response('Country not found', { status: 404 }));

    const countries = await searchCountries('ytreg', new AbortController().signal);

    expect(countries).toEqual([]);
  });

  test.each([400, 429, 500])('бросает HttpError со статусом %i', async (status) => {
    mockFetch(new Response('error', { status }));

    const result = searchCountries('italy', new AbortController().signal);

    await expect(result).rejects.toBeInstanceOf(HttpError);
    await expect(result).rejects.toMatchObject({ status });
  });

  test('отправляет запрос на адрес countries.dev с текстом поиска', async () => {
    const fetchMock = mockFetch(new Response('[]', { status: 200 }));

    await searchCountries('italy', new AbortController().signal);

    expect(fetchMock).toHaveBeenCalledWith('https://countries.dev/name/italy', expect.anything());
  });

  test('сигнал, переданный в fetch, отменяется вместе с исходным', async () => {
    const fetchMock = mockFetch(new Response('[]', { status: 200 }));
    const controller = new AbortController();

    await searchCountries('italy', controller.signal);
    const passedSignal = fetchMock.mock.calls[0][1].signal;
    controller.abort();

    expect(passedSignal.aborted).toBe(true);
  });

  test('пробрасывает ошибку, если fetch отклонился из-за сети', async () => {
    const networkError = new TypeError('Failed to fetch');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(networkError));

    const result = searchCountries('italy', new AbortController().signal);

    await expect(result).rejects.toBe(networkError);
  });

  test('отклоняется с TimeoutError, если ответ не пришёл за отведённое время', async () => {
    mockHangingFetch();

    const result = searchCountries('italy', new AbortController().signal, 10);

    await expect(result).rejects.toHaveProperty('name', 'TimeoutError');
  });

  test('отклоняется с AbortError, если исходный сигнал отменён', async () => {
    mockHangingFetch();
    const controller = new AbortController();

    const result = searchCountries('italy', controller.signal);
    controller.abort();

    await expect(result).rejects.toHaveProperty('name', 'AbortError');
  });

  test('кодирует текст поиска в адресе запроса', async () => {
    const fetchMock = mockFetch(new Response('[]', { status: 200 }));

    await searchCountries('new york / usa', new AbortController().signal);

    expect(fetchMock).toHaveBeenCalledWith('https://countries.dev/name/new%20york%20%2F%20usa', expect.anything());
  });
});
