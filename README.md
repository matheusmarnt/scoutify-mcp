# @matheusmarnt/scoutify-mcp

MCP server for [Scoutify](https://github.com/matheusmarnt/scoutify) — provides AI assistants with accurate, version-pinned Scoutify documentation and code scaffolding tools.

Prevents hallucinations of removed config keys (`icon_prefix`, `types`, `classes`, `colors`, `modal.ui`) and never-existed keys (`theme`, `i18n`, `behavior`, etc.).

## Tools

| Tool | Description |
|------|-------------|
| `get_antipatterns` | List all Scoutify antipatterns — **call before generating any Scoutify code** |
| `search_docs` | Search documentation by keyword, returns ranked snippets |
| `get_page` | Get full content of a docs page by slug |
| `list_pages` | List all available documentation pages |
| `scaffold_searchable_model` | Generate an Eloquent model with `GloballySearchable` contract stub |
| `scaffold_visibility_rule` | Generate `HasGlobalSearchVisibility` with chosen auth strategy |
| `scaffold_theme_config` | Generate `ScoutifyServiceProvider` boot() with types/theme/UI config |
| `validate_snippet` | Lint PHP/Blade code against known Scoutify antipatterns |

## Installation

### Claude Code

```bash
claude mcp add scoutify -- npx -y @matheusmarnt/scoutify-mcp
```

### Cursor

Add to `~/.cursor/mcp.json` (or `.cursor/mcp.json` in your project):

```json
{
  "mcpServers": {
    "scoutify": {
      "command": "npx",
      "args": ["-y", "@matheusmarnt/scoutify-mcp"]
    }
  }
}
```

### Codex CLI

Add to `~/.codex/config.toml`:

```toml
[mcp_servers.scoutify]
command = "npx"
args = ["-y", "@matheusmarnt/scoutify-mcp"]
```

### Gemini CLI

Add to `~/.gemini/settings.json`:

```json
{
  "mcpServers": {
    "scoutify": {
      "command": "npx",
      "args": ["-y", "@matheusmarnt/scoutify-mcp"]
    }
  }
}
```

### Windsurf / Cline / Zed

Add to your MCP config file (path varies by client):

```json
{
  "mcpServers": {
    "scoutify": {
      "command": "npx",
      "args": ["-y", "@matheusmarnt/scoutify-mcp"]
    }
  }
}
```

### GitHub Copilot (VS Code)

Add to `.vscode/mcp.json` in your project:

```json
{
  "servers": {
    "scoutify": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@matheusmarnt/scoutify-mcp"]
    }
  }
}
```

## Static Documentation Access (any AI client)

If your AI client doesn't support MCP, fetch docs directly:

```
https://matheusmarnt.github.io/scoutify/llms.txt       — curated index + antipatterns
https://matheusmarnt.github.io/scoutify/llms-full.txt  — full documentation corpus
```

## Requirements

- Node.js >= 18
- Internet access (fetches docs from GitHub Pages, cached 1h per session)

## License

MIT
