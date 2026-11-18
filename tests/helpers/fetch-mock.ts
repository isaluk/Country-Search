import { vi } from 'vitest';

export interface PendingRequest {
  readonly url: string;
  readonly signal: AbortSignal;
  readonly respond: (body: unknown, status?: number) => void;
  readonly fail: (error: unknown) => void;
}

export const createFetchMock = () => {
  const requests: PendingRequest[] = [];

  const fetchMock = vi.fn(
    (input: string | URL | Request, init?: RequestInit) =>
      new Promise<Response>((resolve, reject) => {
        const signal = init?.signal ?? new AbortController().signal;

        if (signal.aborted) {
          reject(signal.reason);
          return;
        }

        signal.addEventListener('abort', () => reject(signal.reason), {
          once: true,
        });
        requests.push({
          url: String(input),
          signal,
          respond: (body, status = 200) =>
            resolve(new Response(JSON.stringify(body), { status })),
          fail: reject,
        });
      }),
  );

  return { fetchMock, requests };
};
