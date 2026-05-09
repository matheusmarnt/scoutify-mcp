interface TypeRegistration {
  class: string;
  label: string;
  icon: string;
  color: string;
}

interface ThemeOverrides {
  input?: string;
  trigger?: string;
}

interface UiFlags {
  showTypeChips?: boolean;
  showHintBar?: boolean;
  showToggleIncludeTrashed?: boolean;
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
      lines.push(`            ->register(${t.class}::class, '${t.label}', '${t.icon}', Color::${t.color})`);
    }
    lines.push(`        ;`);
  }

  const themeLines: string[] = [];
  if (themeOverrides.input) themeLines.push(`            ->input('${themeOverrides.input}')`);
  if (themeOverrides.trigger) themeLines.push(`            ->trigger('${themeOverrides.trigger}')`);
  if (themeLines.length > 0) {
    lines.push(`        Scoutify::theme()\n${themeLines.join('\n')}\n        ;`);
  }

  const uiLines: string[] = [];
  if (uiFlags.showTypeChips !== undefined) {
    uiLines.push(`            ->${uiFlags.showTypeChips ? 'showTypeChips' : 'hideTypeChips'}()`);
  }
  if (uiFlags.showHintBar !== undefined) {
    uiLines.push(`            ->${uiFlags.showHintBar ? 'showHintBar' : 'hideHintBar'}()`);
  }
  if (uiFlags.showToggleIncludeTrashed !== undefined) {
    uiLines.push(`            ->${uiFlags.showToggleIncludeTrashed ? 'showToggleIncludeTrashed' : 'hideToggleIncludeTrashed'}()`);
  }
  if (uiLines.length > 0) {
    lines.push(`        Scoutify::configureUi(function (\\Matheusmarnt\\Scoutify\\Support\\UiConfig $ui) {\n            $ui\n${uiLines.join('\n')}\n            ;\n        });`);
  }

  const body = lines.join('\n\n');

  return `use Matheusmarnt\\Scoutify\\Facades\\Scoutify;
use Matheusmarnt\\Scoutify\\Enums\\Color;

// In your ScoutifyServiceProvider::boot() or AppServiceProvider::boot():

public function boot(): void
{
${body || '        // No configuration specified.'}
}
`;
}
