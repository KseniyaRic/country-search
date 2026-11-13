import { describe, test, expect } from 'vitest';
import { HttpError } from '../src/HttpError.js';
import { classifyError } from '../src/classifyError.js';

describe('classifyError', () => {
  test('определяет отмену своего запроса по имени AbortError', () => {
    const error = new DOMException('The operation was aborted', 'AbortError');

    expect(classifyError(error)).toBe('aborted');
  });

  test('определяет таймаут по имени TimeoutError', () => {
    const error = new DOMException('The operation timed out', 'TimeoutError');

    expect(classifyError(error)).toBe('timeout');
  });

  test('определяет ответ сервера с ошибкой по HttpError', () => {
    const error = new HttpError(500, 'Request failed with status 500');

    expect(classifyError(error)).toBe('http');
  });

  test('определяет сбой сети по TypeError', () => {
    const error = new TypeError('Failed to fetch');

    expect(classifyError(error)).toBe('network');
  });

  test('возвращает unknown для ошибки неизвестного вида', () => {
    expect(classifyError(new Error('boom'))).toBe('unknown');
  });

  test('возвращает unknown, если брошено не Error', () => {
    expect(classifyError('oops')).toBe('unknown');
  });
});
