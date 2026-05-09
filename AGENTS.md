# AGENTS.md — scoutify-mcp

Instructions for AI agents (Claude, Copilot, Codex, Gemini) working in this repository.

---

## Package Overview

`@matheusmarnt/scoutify-mcp` — MCP server for [Scoutify](https://github.com/matheusmarnt/scoutify). Provides AI assistants with accurate, version-pinned Scoutify documentation and PHP scaffolding tools. Prevents hallucination of removed/non-existent config keys.

**Current version:** 0.1.1 | **Node:** >=18 | **Runtime:** stdio MCP (JSON-RPC 2.0)

---

## Repository Structure

```
src/
  server.ts               # MCP server bootstrap + tool registration (8 tools)
  fetcher.ts              # LRU cache + ETag revalidation for GitHub Pages fetch
  tools/
    search-docs.ts        # search_docs — term-frequency ranking over llms-full.txt
    get-page.ts           # get_page — return full body of one page by slug
    list-pages.ts         # list_pages — parse Page Index from llms.txt
    get-antipatterns.ts   # get_antipatterns — parse Antipatterns block from llms.txt
  scaffolds/
    searchable-model.ts   # scaffold_searchable_model — GloballySearchable PHP stub
    visibility-rule.ts    # scaffold_visibility_rule — HasGlobalSearchVisibility stubs (5 strategies)
    theme-config.ts       # scaffold_theme_config — ScoutifyServiceProvider boot() stubs
    validate-snippet.ts   # validate_snippet — regex linter (11 rules)
tests/
  fetcher.test.ts
  tools/
    search-docs.test.ts
    docs-tools.test.ts    # get_page, list_pages, get_antipatterns
  scaffolds/
    searchable-model.test.ts
    visibility-rule.test.ts
    theme-config.test.ts
    validate-snippet.test.ts
dist/
  server.js               # built output (tsup ESM, shebang injected via banner)
tsup.config.ts            # banner: { js: '#!/usr/bin/env node' }
```

---

## Running Tests

```bash
npm test                  # vitest run (37 tests, 7 files)
npm run build             # tsup → dist/server.js (18KB)
```

Always run full suite before committing. Target: all tests green, no TypeScript errors.

---

## Coding Conventions

- **TypeScript strict** — no `any`, no unchecked access.
- **No comments** unless WHY is non-obvious.
- **No backwards-compat hacks**.
- **TDD** — write failing test first, implement, run GREEN, then commit.
- ESM only (`"type": "module"`). All imports use `.js` extensions.
- No external runtime deps beyond `@modelcontextprotocol/sdk`.

---

## MCP Tools Reference

| Tool | Source | Input |
|------|--------|-------|
| `search_docs` | `src/tools/search-docs.ts` | `{ query: string, limit?: number }` |
| `get_page` | `src/tools/get-page.ts` | `{ slug: string }` |
| `list_pages` | `src/tools/list-pages.ts` | `{}` |
| `get_antipatterns` | `src/tools/get-antipatterns.ts` | `{}` |
| `scaffold_searchable_model` | `src/scaffolds/searchable-model.ts` | `{ className, fields[], titleField, subtitleField, routeName, typeKey }` |
| `scaffold_visibility_rule` | `src/scaffolds/visibility-rule.ts` | `{ className, strategy, role?, permission? }` |
| `scaffold_theme_config` | `src/scaffolds/theme-config.ts` | `{ types[]?, themeOverrides?, uiFlags? }` |
| `validate_snippet` | `src/scaffolds/validate-snippet.ts` | `{ code: string }` |

### Visibility strategies
`guests-allowed` | `auth-only` | `spatie-role` | `spatie-permission` | `callback`

---

## Data Sources

Static files fetched from GitHub Pages (Scoutify docs site):
```
https://matheusmarnt.github.io/scoutify/llms.txt       — curated index + antipatterns
https://matheusmarnt.github.io/scoutify/llms-full.txt  — full corpus (20 pages)
```

**Section format in `llms-full.txt`:** `\n## <slug>\n\n<body>` — NO `---` separator prefix.
**Cache:** `Fetcher` class — 1h TTL, `If-None-Match` ETag revalidation, in-memory Map.

---

## Validate Snippet Rules (11 rules in `src/scaffolds/validate-snippet.ts`)

| Rule ID | Pattern | Severity |
|---------|---------|----------|
| `legacy_config_icon_prefix` | `'icon_prefix' =>` | error |
| `legacy_config_types_array` | `'types' => [` | error |
| `legacy_config_classes` | `'classes' =>` | error |
| `legacy_config_colors` | `'colors' =>` | error |
| `legacy_config_modal_ui` | `'modal' => ['ui' =>` | error |
| `nonexistent_key_theme` | `'theme' =>` | error |
| `nonexistent_key_i18n` | `'i18n' =>` | error |
| `nonexistent_key_behavior` | `'behavior' =>` | error |
| `nonexistent_key_min_query_length` | `'min_query_length' =>` | error |
| `button_in_anchor` | `<a...><button` | error |
| `alpine_prevent_with_guard` | `@x.prevent="if (` | error |

---

## Build + Publish

```bash
npm run build             # tsup → dist/server.js with shebang banner
npm publish --access public   # requires npm auth token set via npm set //registry.npmjs.org/:_authToken=<token>
```

**Critical:** `package.json` bin must use `"dist/server.js"` (NO `./` prefix) — npm 10 auto-removes entries with `./dist/...` prefix. tsup `banner: { js: '#!/usr/bin/env node' }` injects shebang into built file.

**Token:** Use Automation-type token (or any token with write:packages). Set via:
```bash
npm set //registry.npmjs.org/:_authToken=<token>
```

---

## Branch Naming

```
feat/<kebab-feature>
fix/<kebab-description>
docs/<kebab-description>
chore/<kebab-description>
```

---

## Release Workflow

1. Bump version: `npm version patch|minor|major --no-git-tag-version`
2. Commit: `git commit -m "chore: release vX.Y.Z"`
3. Tag: `git tag vX.Y.Z && git push origin main --tags`
4. Publish: `npm publish --access public`

No release-please here — manual publish.

---

## What NOT to Do

- Do not add runtime dependencies beyond `@modelcontextprotocol/sdk`.
- Do not hardcode Scoutify docs URLs except in `src/fetcher.ts` (`BASE_URL` constant).
- Do not mock `Fetcher` in docs-tool tests — use in-memory corpus strings instead.
- Do not use `./` prefix in `package.json` `bin` values — npm 10 removes them silently.
- Do not add `---` separators between page sections in `llms-full.txt` parser logic — separator is `\n## ` only.
- Do not add `Co-Authored-By` in commits.
- Do not generate scaffold output that contains legacy Scoutify config keys (`icon_prefix`, `types`, `classes`, `colors`, `modal.ui`) — validated by tests in `theme-config.test.ts`.
