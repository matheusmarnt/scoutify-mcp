import { describe, it, expect } from 'vitest';
import { validateSnippet } from '../../src/scaffolds/validate-snippet.js';

describe('validateSnippet', () => {
  it('flags legacy icon_prefix config key', () => {
    const result = validateSnippet(`return ['icon_prefix' => 'heroicon-o-'];`);
    expect(result.violations.some(v => v.id === 'legacy_config_icon_prefix')).toBe(true);
  });

  it('flags legacy types array config key', () => {
    const result = validateSnippet(`'types' => [\n  App\\Models\\Post::class\n]`);
    expect(result.violations.some(v => v.id === 'legacy_config_types_array')).toBe(true);
  });

  it('flags never-existed theme config key', () => {
    const result = validateSnippet(`return ['theme' => 'dark'];`);
    expect(result.violations.some(v => v.id === 'nonexistent_key_theme')).toBe(true);
  });

  it('flags button nested in anchor', () => {
    const result = validateSnippet(`<a href="/foo"><button>Click</button></a>`);
    expect(result.violations.some(v => v.id === 'button_in_anchor')).toBe(true);
  });

  it('flags Alpine prevent with conditional guard', () => {
    const result = validateSnippet(`@keydown.enter.prevent="if (cond) doThing()"`);
    expect(result.violations.some(v => v.id === 'alpine_prevent_with_guard')).toBe(true);
  });

  it('returns no violations for clean code', () => {
    const result = validateSnippet(`Scoutify::types()->register(Post::class, 'Post', 'heroicon-o-document', Color::Blue);`);
    expect(result.violations).toHaveLength(0);
  });

  it('returns line number in violation', () => {
    const result = validateSnippet(`<?php\n\nreturn ['icon_prefix' => 'heroicon-o-'];\n`);
    const v = result.violations.find(v => v.id === 'legacy_config_icon_prefix');
    expect(v?.line).toBe(3);
  });
});
