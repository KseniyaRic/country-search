export function debounce<Args extends unknown[]>(fn: (...args: Args) => void, delay: number): (...args: Args) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Args): void => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout((): void => {
      fn(...args);
    }, delay);
  };
}
