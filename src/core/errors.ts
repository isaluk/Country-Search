export class HttpError extends Error {
  readonly status: number;

  constructor(status: number, statusText = '') {
    super(`HTTP ${status} ${statusText}`.trim());
    this.name = 'HttpError';
    this.status = status;
  }
}

export type SearchFailure =
  | { readonly kind: 'timeout' }
  | { readonly kind: 'http'; readonly status: number }
  | { readonly kind: 'network' }
  | { readonly kind: 'unknown' };

export type SearchOutcome = { readonly kind: 'aborted' } | SearchFailure;

const hasErrorName = (error: unknown, name: string): boolean =>
  error instanceof Error && error.name === name;

export const isAbortError = (error: unknown): boolean =>
  hasErrorName(error, 'AbortError');

export const isTimeoutError = (error: unknown): boolean =>
  hasErrorName(error, 'TimeoutError');

export const classifyError = (error: unknown): SearchOutcome => {
  if (isAbortError(error)) return { kind: 'aborted' };
  if (isTimeoutError(error)) return { kind: 'timeout' };
  if (error instanceof HttpError) return { kind: 'http', status: error.status };
  if (error instanceof TypeError) return { kind: 'network' };

  return { kind: 'unknown' };
};
