// Utility helper
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function debounce<T extends (...args: unknown[]) => unknown>(fn: T, ms: number): T {
  let timer: number | null = null;
  return ((...args: unknown[]) => {
    if (timer) window.clearTimeout(timer);
    timer = window.setTimeout(() => fn(...args), ms);
  }) as T;
}
