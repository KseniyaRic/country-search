import { describe, test, expect, beforeEach, vi, afterEach } from 'vitest';
import { debounce } from '../src/debounce.js';

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('не вызывает функцию мгновенно', () => {
    const mockFn = vi.fn();
    const debounced = debounce(mockFn, 300);

    debounced();
    expect(mockFn).not.toHaveBeenCalled();
  });

  test('не вызывает функцию до установленного времени', () => {
    const mockFn = vi.fn();
    const debounced = debounce(mockFn, 300);

    debounced();

    vi.advanceTimersByTime(299);
    expect(mockFn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(mockFn).toHaveBeenCalled();
  });

  test('вызывает функцию по истечении установленного времени один раз', () => {
    const mockFn = vi.fn();
    const debounced = debounce(mockFn, 300);

    debounced();

    vi.advanceTimersByTime(300);
    vi.advanceTimersByTime(1000);

    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  test('обновляет таймер при каждом новом вызове', () => {
    const mockFn = vi.fn();
    const debounced = debounce(mockFn, 300);

    debounced();
    vi.advanceTimersByTime(299);
    debounced();
    vi.advanceTimersByTime(299);
    debounced();
    vi.advanceTimersByTime(299);
    expect(mockFn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(300);
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  test('функция получает аргументы последнего вызова', () => {
    const mockFn = vi.fn();
    const debounced = debounce(mockFn, 300);

    debounced('i');
    debounced('it');
    debounced('italy');

    vi.advanceTimersByTime(300);
    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith('italy');
  });

  test('после того как функция сработала, новый вызов запускает её снова', () => {
    const mockFn = vi.fn();
    const debounced = debounce(mockFn, 300);

    debounced();
    vi.advanceTimersByTime(300);

    debounced();
    vi.advanceTimersByTime(300);

    expect(mockFn).toHaveBeenCalledTimes(2);
  });
});
