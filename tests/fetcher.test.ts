import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Fetcher, ScoutifyDocsUnavailable } from '../src/fetcher.js';

describe('Fetcher', () => {
  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('fetches and returns body on first request', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response('content', { status: 200, headers: { etag: 'W/"1"' } })
    );
    const f = new Fetcher({ baseUrl: 'https://x.test', ttlMs: 60_000 });
    const result = await f.get('/llms.txt');
    expect(result).toBe('content');
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });

  it('returns cache within TTL without second fetch', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response('cached', { status: 200, headers: { etag: 'W/"1"' } })
    );
    const f = new Fetcher({ baseUrl: 'https://x.test', ttlMs: 60_000 });
    await f.get('/llms.txt');
    await f.get('/llms.txt');
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });

  it('revalidates with If-None-Match after TTL expires', async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response('body', { status: 200, headers: { etag: 'W/"1"' } }))
      .mockResolvedValueOnce(new Response(null, { status: 304 }));
    globalThis.fetch = fetchMock;
    const f = new Fetcher({ baseUrl: 'https://x.test', ttlMs: 1000 });
    await f.get('/llms.txt');
    vi.advanceTimersByTime(2000);
    const result = await f.get('/llms.txt');
    expect(result).toBe('body');
    const secondCall = fetchMock.mock.calls[1][1] as RequestInit;
    expect((secondCall.headers as Record<string, string>)['If-None-Match']).toBe('W/"1"');
    vi.useRealTimers();
  });

  it('throws ScoutifyDocsUnavailable on non-2xx/304', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(new Response('err', { status: 503 }));
    const f = new Fetcher({ baseUrl: 'https://x.test', ttlMs: 60_000 });
    await expect(f.get('/llms.txt')).rejects.toThrow(ScoutifyDocsUnavailable);
  });
});
