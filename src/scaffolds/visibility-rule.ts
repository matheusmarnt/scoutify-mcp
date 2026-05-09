type VisibilityStrategy = 'guests-allowed' | 'auth-only' | 'spatie-role' | 'spatie-permission' | 'callback';

interface VisibilityRuleOptions {
  strategy: VisibilityStrategy;
  role?: string;
  permission?: string;
}

export function scaffoldVisibilityRule(className: string, opts: VisibilityRuleOptions): string {
  const { strategy, role, permission } = opts;

  const ruleBody = {
    'guests-allowed': `VisibilityRule::make()->visibleToGuests()->orWhenAuthenticated()->policy('view')`,
    'auth-only': `VisibilityRule::make()->whenAuthenticated()->policy('view')`,
    'spatie-role': `VisibilityRule::make()->whenAuthenticated()->role('${role ?? 'admin'}')`,
    'spatie-permission': `VisibilityRule::make()->whenAuthenticated()->permission('${permission ?? 'view-results'}')`,
    'callback': `VisibilityRule::make()->whenAuthenticated()->using(fn ($user, $record) => /* TODO: return bool */)`,
  }[strategy];

  return `use Matheusmarnt\\Scoutify\\Authorization\\VisibilityRule;
use Matheusmarnt\\Scoutify\\Contracts\\HasGlobalSearchVisibility;

// Add to ${className}:
// class ${className} extends Model implements GloballySearchable, HasGlobalSearchVisibility

public function globalSearchVisibility(): VisibilityRule
{
    return ${ruleBody};
}
`;
}
