export class ScoutifyDocsUnavailable extends Error {
  constructor(path: string, status: number) {
    super(`Scoutify docs unavailable: ${path} returned HTTP ${status}`);
  }
}

interface CacheEntry {
  body: string;
  etag: string | null;
  expiresAt: number;
}

export class Fetcher {
  private cache = new Map<string, CacheEntry>();
  private baseUrl: string;
  private ttlMs: number;

  constructor({ baseUrl, ttlMs }: { baseUrl: string; ttlMs: number }) {
    this.baseUrl = baseUrl;
    this.ttlMs = ttlMs;
  }

  async get(path: string): Promise<string> {
    const cached = this.cache.get(path);
    const now = Date.now();

    if (cached && now < cached.expiresAt) {
      return cached.body;
    }

    const headers: Record<string, string> = {};
    if (cached?.etag) {
      headers['If-None-Match'] = cached.etag;
    }

    const res = await fetch(this.baseUrl + path, { headers });

    if (res.status === 304 && cached) {
      cached.expiresAt = now + this.ttlMs;
      return cached.body;
    }

    if (!res.ok) {
      throw new ScoutifyDocsUnavailable(path, res.status);
    }

    const body = await res.text();
    this.cache.set(path, {
      body,
      etag: res.headers.get('etag'),
      expiresAt: now + this.ttlMs,
    });
    return body;
  }
}
