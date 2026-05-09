import { describe, it, expect } from 'vitest';
import { searchDocs } from '../../src/tools/search-docs.js';

const SAMPLE_FULL = `# Scoutify

## Antipatterns (DO NOT GENERATE)

### legacy_config_icon_prefix (severity: error)
**Rule:** Never write 'icon_prefix' in config/scoutify.php.

## Page Index

- [Installation](https://matheusmarnt.github.io/scoutify/getting-started/installation/)

## getting-started/installation

Run composer require matheusmarnt/scoutify then php artisan scoutify:install.

## usage/registering-models

Use GloballySearchable contract and implement toSearchableArray on your Eloquent model.
The visibility rule controls who can see results.

## authorization/visibility-rules

VisibilityRule::make()->whenAuthenticated()->policy('view') restricts to authed users.
Use visibleToGuests() to allow unauthenticated access.`;

describe('searchDocs', () => {
  it('returns matches sorted by relevance', async () => {
    const result = searchDocs(SAMPLE_FULL, { query: 'visibility rule', limit: 2 });
    expect(result.matches.length).toBeGreaterThan(0);
    expect(result.matches[0].slug).toBe('authorization/visibility-rules');
  });

  it('returns slug and url in each match', async () => {
    const result = searchDocs(SAMPLE_FULL, { query: 'installation', limit: 3 });
    expect(result.matches[0].url).toBe('https://matheusmarnt.github.io/scoutify/getting-started/installation/');
    expect(result.matches[0].snippet).toContain('composer require');
  });

  it('skips preamble sections (Antipatterns, Page Index)', async () => {
    const result = searchDocs(SAMPLE_FULL, { query: 'icon_prefix', limit: 5 });
    expect(result.matches.every(m => !m.slug.startsWith('Antipatterns'))).toBe(true);
  });

  it('returns empty matches for no-hit query', async () => {
    const result = searchDocs(SAMPLE_FULL, { query: 'zzznomatch999', limit: 5 });
    expect(result.matches).toHaveLength(0);
  });
});
