interface Violation {
  id: string;
  severity: 'error' | 'warning';
  line: number;
  message: string;
  fixHint: string;
}

interface ValidationResult {
  violations: Violation[];
}

const RULES: Array<{
  id: string;
  severity: 'error' | 'warning';
  pattern: RegExp;
  message: string;
  fixHint: string;
}> = [
  {
    id: 'legacy_config_icon_prefix',
    severity: 'error',
    pattern: /['"]icon_prefix['"]\s*=>/g,
    message: "Config key 'icon_prefix' removed in v2.0.0. ScoutifyServiceProvider throws RuntimeException on boot.",
    fixHint: "Use Scoutify::types()->iconPrefix('heroicon-o-') in a service provider.",
  },
  {
    id: 'legacy_config_types_array',
    severity: 'error',
    pattern: /['"]types['"]\s*=>\s*\[/g,
    message: "Config key 'types' removed in v2.0.0.",
    fixHint: 'Use Scoutify::types()->register(MyModel::class, ...) in a service provider.',
  },
  {
    id: 'legacy_config_classes',
    severity: 'error',
    pattern: /['"]classes['"]\s*=>/g,
    message: "Config key 'classes' removed in v2.0.0.",
    fixHint: "Use Scoutify::theme()->input('...')->trigger('...').",
  },
  {
    id: 'legacy_config_colors',
    severity: 'error',
    pattern: /['"]colors['"]\s*=>/g,
    message: "Config key 'colors' removed in v2.0.0.",
    fixHint: "Use Scoutify::theme()->color('name', 'light', 'dark').",
  },
  {
    id: 'legacy_config_modal_ui',
    severity: 'error',
    pattern: /['"]modal['"]\s*=>\s*\[[\s\S]*?['"]ui['"]/g,
    message: "Config key 'modal.ui' removed in v2.0.0.",
    fixHint: 'Use Scoutify::configureUi(fn (UiConfig $ui) => ...).',
  },
  {
    id: 'nonexistent_key_theme',
    severity: 'error',
    pattern: /['"]theme['"]\s*=>/g,
    message: "Config key 'theme' never existed in any version of Scoutify.",
    fixHint: 'Use Scoutify::theme() fluent API in a service provider.',
  },
  {
    id: 'nonexistent_key_i18n',
    severity: 'error',
    pattern: /['"]i18n['"]\s*=>/g,
    message: "Config key 'i18n' never existed in Scoutify.",
    fixHint: 'This is a documentation error. No i18n config key exists.',
  },
  {
    id: 'nonexistent_key_behavior',
    severity: 'error',
    pattern: /['"]behavior['"]\s*=>/g,
    message: "Config key 'behavior' never existed in Scoutify.",
    fixHint: 'This is a documentation error.',
  },
  {
    id: 'nonexistent_key_min_query_length',
    severity: 'error',
    pattern: /['"]min_query_length['"]\s*=>/g,
    message: "Config key 'min_query_length' never existed in Scoutify.",
    fixHint: "Use 'debounce_ms' to control search timing.",
  },
  {
    id: 'button_in_anchor',
    severity: 'error',
    pattern: /<a[^>]*>[\s\S]*?<button/g,
    message: 'Never nest <button> inside <a>. HTML5 forbids interactive content inside interactive content.',
    fixHint: 'Use the result-row overlay pattern (z-0 link + z-10 content div) instead.',
  },
  {
    id: 'alpine_prevent_with_guard',
    severity: 'error',
    pattern: /@\w[\w.:-]*\.prevent\s*=\s*["'][^"']*\bif\s*\(/g,
    message: 'Alpine .prevent modifier fires before expression evaluates, making conditional guard ineffective.',
    fixHint: 'Remove .prevent; call $event.preventDefault() inside the if body.',
  },
  {
    id: 'dialog_panel_with_background',
    severity: 'warning',
    pattern: /->dialogPanel\s*\(\s*['"][^'"]*\bbg-\w/g,
    message: 'dialogPanel() is the outer positioning wrapper and has no visible background. Background classes on dialogPanel() have no effect.',
    fixHint: 'Move background classes to dialogContent() which controls the visible card (background, shadow, border-radius).',
  },
];

function lineOf(code: string, index: number): number {
  return code.slice(0, index).split('\n').length;
}

export function validateSnippet(code: string): ValidationResult {
  const violations: Violation[] = [];
  for (const rule of RULES) {
    rule.pattern.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = rule.pattern.exec(code)) !== null) {
      violations.push({
        id: rule.id,
        severity: rule.severity,
        line: lineOf(code, match.index),
        message: rule.message,
        fixHint: rule.fixHint,
      });
    }
  }
  return { violations };
}
