interface TypeRegistration {
  class: string;
  label: string;
  icon: string;
  color: string;
}

interface ThemeOverrides {
  dialogPanel?: string;
  dialogContent?: string;
  dialogScrim?: string;
  input?: string;
  trigger?: string;
  triggerMobile?: string;
  toggleActive?: string;
  toggleInactive?: string;
}

interface UiFlags {
  showTypeChips?: boolean;
  showToggleOnlyActive?: boolean;
  showToggleIncludeTrashed?: boolean;
  showHintBar?: boolean;
  showIdleHint?: boolean;
}

interface ThemeConfigOptions {
  types?: TypeRegistration[];
  themeOverrides?: ThemeOverrides;
  uiFlags?: UiFlags;
}

export function scaffoldThemeConfig(opts: ThemeConfigOptions): string {
  const { types = [], themeOverrides = {}, uiFlags = {} } = opts;
  const lines: string[] = [];

  if (types.length > 0) {
    lines.push(`        Scoutify::types()`);
    for (const t of types) {
      lines.push(`            ->register(${t.class}::class, label: '${t.label}', icon: '${t.icon}', color: '${t.color}')`);
    }
    lines.push(`        ;`);
  }

  const themeKeys: Array<keyof ThemeOverrides> = [
    'dialogPanel', 'dialogContent', 'dialogScrim',
    'input', 'trigger', 'triggerMobile',
    'toggleActive', 'toggleInactive',
  ];
  const themeLines: string[] = [];
  for (const key of themeKeys) {
    if (themeOverrides[key]) themeLines.push(`            ->${key}('${themeOverrides[key]}')`);
  }
  if (themeLines.length > 0) {
    lines.push(`        Scoutify::theme()\n${themeLines.join('\n')}\n        ;`);
  }

  const uiKeys: Array<keyof UiFlags> = [
    'showTypeChips', 'showToggleOnlyActive', 'showToggleIncludeTrashed',
    'showHintBar', 'showIdleHint',
  ];
  const uiLines: string[] = [];
  for (const key of uiKeys) {
    if (uiFlags[key] !== undefined) {
      uiLines.push(`            ->${ key }(${ uiFlags[key] ? 'true' : 'false' })`);
    }
  }
  if (uiLines.length > 0) {
    lines.push(`        Scoutify::configureUi(function (\\Matheusmarnt\\Scoutify\\Support\\UiConfig $ui) {\n            $ui\n${uiLines.join('\n')}\n            ;\n        });`);
  }

  const body = lines.join('\n\n');

  return `use Matheusmarnt\\Scoutify\\Facades\\Scoutify;
use Matheusmarnt\\Scoutify\\Support\\UiConfig;

// In your AppServiceProvider::boot():

public function boot(): void
{
${body || '        // No configuration specified.'}
}
`;
}
