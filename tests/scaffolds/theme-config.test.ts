import { describe, it, expect } from 'vitest';
import { scaffoldThemeConfig } from '../../src/scaffolds/theme-config.js';

describe('scaffoldThemeConfig', () => {
  it('generates Scoutify::types()->register() for each type', () => {
    const code = scaffoldThemeConfig({
      types: [{ class: 'Post', label: 'Post', icon: 'heroicon-o-document', color: 'Blue' }],
    });
    expect(code).toContain('Scoutify::types()');
    expect(code).toContain("->register(Post::class, 'Post', 'heroicon-o-document', Color::Blue)");
  });

  it('never contains legacy config key icon_prefix as array key', () => {
    const code = scaffoldThemeConfig({ types: [{ class: 'Post', label: 'Post', icon: 'heroicon-o-document', color: 'Blue' }] });
    expect(code).not.toMatch(/'icon_prefix'\s*=>/);
  });

  it('never contains legacy config key types as array', () => {
    const code = scaffoldThemeConfig({ types: [{ class: 'Post', label: 'Post', icon: 'heroicon-o-document', color: 'Blue' }] });
    expect(code).not.toMatch(/'types'\s*=>\s*\[/);
  });

  it('generates Scoutify::theme() for overrides', () => {
    const code = scaffoldThemeConfig({ themeOverrides: { input: 'border-red-500' } });
    expect(code).toContain("Scoutify::theme()");
    expect(code).toContain("->input('border-red-500')");
  });

  it('generates configureUi for ui flags', () => {
    const code = scaffoldThemeConfig({ uiFlags: { showTypeChips: true, showHintBar: false } });
    expect(code).toContain('Scoutify::configureUi(');
    expect(code).toContain('->showTypeChips()');
    expect(code).toContain('->hideHintBar()');
  });
});
