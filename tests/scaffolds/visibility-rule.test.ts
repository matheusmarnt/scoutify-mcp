import { describe, it, expect } from 'vitest';
import { scaffoldVisibilityRule } from '../../src/scaffolds/visibility-rule.js';

describe('scaffoldVisibilityRule', () => {
  it('guests-allowed uses visibleToGuests', () => {
    const code = scaffoldVisibilityRule('Post', { strategy: 'guests-allowed' });
    expect(code).toContain('visibleToGuests()');
    expect(code).toContain("policy('view')");
  });

  it('auth-only uses whenAuthenticated', () => {
    const code = scaffoldVisibilityRule('Post', { strategy: 'auth-only' });
    expect(code).toContain('whenAuthenticated()');
    expect(code).not.toContain('visibleToGuests');
  });

  it('spatie-role uses role()', () => {
    const code = scaffoldVisibilityRule('Post', { strategy: 'spatie-role', role: 'editor' });
    expect(code).toContain("role('editor')");
  });

  it('spatie-permission uses permission()', () => {
    const code = scaffoldVisibilityRule('Post', { strategy: 'spatie-permission', permission: 'view-posts' });
    expect(code).toContain("permission('view-posts')");
  });

  it('callback emits TODO placeholder', () => {
    const code = scaffoldVisibilityRule('Post', { strategy: 'callback' });
    expect(code).toContain('TODO');
    expect(code).toContain('using(fn ($user, $record)');
  });

  it('never references GloballySearchable as the only interface (HasGlobalSearchVisibility is separate)', () => {
    const code = scaffoldVisibilityRule('Post', { strategy: 'auth-only' });
    expect(code).toContain('HasGlobalSearchVisibility');
  });
});
