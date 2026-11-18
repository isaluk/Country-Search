export class HttpError extends Error {
  readonly status: number = 0;

  constructor(_status: number, _statusText = '') {
    super('Not implemented');
  }
}

export type SearchFailure =
  | { readonly kind: 'timeout' }
  | { readonly kind: 'http'; readonly status: number }
  | { readonly kind: 'network' }
  | { readonly kind: 'unknown' };

export type SearchOutcome = { readonly kind: 'aborted' } | SearchFailure;

export const isAbortError = (_error: unknown): boolean => {
  throw new Error('Not implemented');
};

export const isTimeoutError = (_error: unknown): boolean => {
  throw new Error('Not implemented');
};

export const classifyError = (_error: unknown): SearchOutcome => {
  throw new Error('Not implemented');
};
