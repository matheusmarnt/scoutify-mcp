import { describe, it, expect } from 'vitest';
import { getPage } from '../../src/tools/get-page.js';
import { listPages } from '../../src/tools/list-pages.js';
import { getAntipatterns } from '../../src/tools/get-antipatterns.js';

const SAMPLE_INDEX = `# Scoutify

## Antipatterns (DO NOT GENERATE)

### legacy_config_icon_prefix (severity: error)
**Rule:** Never write 'icon_prefix' in config/scoutify.php.
**Why:** Removed in v2.0.0.
**Fix:** Use Scoutify::types()->iconPrefix().

### button_in_anchor (severity: error)
**Rule:** Never nest button inside a.
**Why:** HTML5 invalid.

## Page Index

- [Installation](https://matheusmarnt.github.io/scoutify/getting-started/installation/) — How to install
- [Registering Models](https://matheusmarnt.github.io/scoutify/usage/registering-models/) — Model setup

## Reference Map

### getting-started
- getting-started/installation

### usage
- usage/registering-models`;

const SAMPLE_FULL = SAMPLE_INDEX + `

## getting-started/installation

Run composer require matheusmarnt/scoutify.

## usage/registering-models

Implement GloballySearchable interface.`;

describe('getPage', () => {
  it('returns body for existing slug', () => {
    expect(getPage(SAMPLE_FULL, 'getting-started/installation')).toContain('composer require');
  });

  it('returns null for unknown slug', () => {
    expect(getPage(SAMPLE_FULL, 'nonexistent/page')).toBeNull();
  });
});

describe('listPages', () => {
  it('returns array of page objects', () => {
    const pages = listPages(SAMPLE_INDEX);
    expect(pages.length).toBeGreaterThanOrEqual(2);
    expect(pages[0]).toMatchObject({ slug: expect.any(String), title: expect.any(String), url: expect.any(String) });
  });

  it('extracts group from slug', () => {
    const pages = listPages(SAMPLE_INDEX);
    const install = pages.find(p => p.slug === 'getting-started/installation');
    expect(install?.group).toBe('getting-started');
  });
});

describe('getAntipatterns', () => {
  it('returns structured antipattern list', () => {
    const patterns = getAntipatterns(SAMPLE_INDEX);
    expect(patterns.length).toBeGreaterThanOrEqual(2);
    expect(patterns[0]).toMatchObject({ id: 'legacy_config_icon_prefix', severity: 'error' });
  });

  it('extracts rule and why from each antipattern', () => {
    const patterns = getAntipatterns(SAMPLE_INDEX);
    const iconPrefix = patterns.find(p => p.id === 'legacy_config_icon_prefix');
    expect(iconPrefix?.rule).toContain("Never write 'icon_prefix'");
    expect(iconPrefix?.why).toContain('Removed in v2.0.0');
  });
});
