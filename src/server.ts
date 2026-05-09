import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { Fetcher } from './fetcher.js';
import { searchDocs } from './tools/search-docs.js';
import { getPage } from './tools/get-page.js';
import { listPages } from './tools/list-pages.js';
import { getAntipatterns } from './tools/get-antipatterns.js';
import { scaffoldSearchableModel, searchableModelInstructions } from './scaffolds/searchable-model.js';
import { scaffoldVisibilityRule } from './scaffolds/visibility-rule.js';
import { scaffoldThemeConfig } from './scaffolds/theme-config.js';
import { validateSnippet } from './scaffolds/validate-snippet.js';

const BASE_URL = 'https://matheusmarnt.github.io/scoutify';
const TTL_MS = 60 * 60 * 1000;

const fetcher = new Fetcher({ baseUrl: BASE_URL, ttlMs: TTL_MS });

const server = new Server(
  { name: 'scoutify-mcp', version: '0.1.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'search_docs',
      description: 'Search Scoutify documentation by keyword. Returns ranked snippets with page URLs.',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search terms' },
          limit: { type: 'number', description: 'Max results (default 5)', default: 5 },
        },
        required: ['query'],
      },
    },
    {
      name: 'get_page',
      description: 'Get full content of a specific Scoutify docs page by slug.',
      inputSchema: {
        type: 'object',
        properties: { slug: { type: 'string', description: 'Page slug, e.g. "usage/registering-models"' } },
        required: ['slug'],
      },
    },
    {
      name: 'list_pages',
      description: 'List all available Scoutify documentation pages with their slugs, titles, and groups.',
      inputSchema: { type: 'object', properties: {} },
    },
    {
      name: 'get_antipatterns',
      description: 'Get the full list of Scoutify antipatterns — code patterns that cause runtime errors or incorrect behavior. Always call this before generating Scoutify code.',
      inputSchema: { type: 'object', properties: {} },
    },
    {
      name: 'scaffold_searchable_model',
      description: 'Generate a PHP Eloquent model stub implementing Scoutify\'s GloballySearchable contract.',
      inputSchema: {
        type: 'object',
        properties: {
          className: { type: 'string' },
          fields: { type: 'array', items: { type: 'string' } },
          titleField: { type: 'string' },
          subtitleField: { type: 'string' },
          routeName: { type: 'string' },
          typeKey: { type: 'string' },
        },
        required: ['className', 'fields', 'titleField', 'subtitleField', 'routeName', 'typeKey'],
      },
    },
    {
      name: 'scaffold_visibility_rule',
      description: 'Generate a HasGlobalSearchVisibility implementation with the chosen authorization strategy.',
      inputSchema: {
        type: 'object',
        properties: {
          className: { type: 'string' },
          strategy: { type: 'string', enum: ['guests-allowed', 'auth-only', 'spatie-role', 'spatie-permission', 'callback'] },
          role: { type: 'string', description: 'Role name (for spatie-role strategy)' },
          permission: { type: 'string', description: 'Permission name (for spatie-permission strategy)' },
        },
        required: ['className', 'strategy'],
      },
    },
    {
      name: 'scaffold_theme_config',
      description: 'Generate ScoutifyServiceProvider boot() code for types, theme, and UI configuration.',
      inputSchema: {
        type: 'object',
        properties: {
          types: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                class: { type: 'string' },
                label: { type: 'string' },
                icon: { type: 'string' },
                color: { type: 'string' },
              },
              required: ['class', 'label', 'icon', 'color'],
            },
          },
          themeOverrides: {
            type: 'object',
            properties: {
              input: { type: 'string' },
              trigger: { type: 'string' },
            },
          },
          uiFlags: {
            type: 'object',
            properties: {
              showTypeChips: { type: 'boolean' },
              showHintBar: { type: 'boolean' },
              showToggleIncludeTrashed: { type: 'boolean' },
            },
          },
        },
      },
    },
    {
      name: 'validate_snippet',
      description: 'Validate PHP or Blade code against known Scoutify antipatterns. Returns violations with line numbers and fix hints.',
      inputSchema: {
        type: 'object',
        properties: { code: { type: 'string', description: 'PHP or Blade code to validate' } },
        required: ['code'],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const args = req.params.arguments as Record<string, unknown>;

  switch (req.params.name) {
    case 'search_docs': {
      const corpus = await fetcher.get('/llms-full.txt');
      const result = searchDocs(corpus, { query: args.query as string, limit: (args.limit as number) ?? 5 });
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    }
    case 'get_page': {
      const corpus = await fetcher.get('/llms-full.txt');
      const body = getPage(corpus, args.slug as string);
      return { content: [{ type: 'text', text: body ?? `Page "${args.slug}" not found. Use list_pages to see available slugs.` }] };
    }
    case 'list_pages': {
      const index = await fetcher.get('/llms.txt');
      const pages = listPages(index);
      return { content: [{ type: 'text', text: JSON.stringify(pages, null, 2) }] };
    }
    case 'get_antipatterns': {
      const index = await fetcher.get('/llms.txt');
      const patterns = getAntipatterns(index);
      return { content: [{ type: 'text', text: JSON.stringify(patterns, null, 2) }] };
    }
    case 'scaffold_searchable_model': {
      const opts = args as Parameters<typeof scaffoldSearchableModel>[0];
      const code = scaffoldSearchableModel(opts);
      const instructions = searchableModelInstructions(opts);
      return { content: [{ type: 'text', text: `${code}\n\n// Setup instructions:\n// ${instructions.replace(/\n/g, '\n// ')}` }] };
    }
    case 'scaffold_visibility_rule': {
      const code = scaffoldVisibilityRule(args.className as string, {
        strategy: args.strategy as Parameters<typeof scaffoldVisibilityRule>[1]['strategy'],
        role: args.role as string | undefined,
        permission: args.permission as string | undefined,
      });
      return { content: [{ type: 'text', text: code }] };
    }
    case 'scaffold_theme_config': {
      const code = scaffoldThemeConfig(args as Parameters<typeof scaffoldThemeConfig>[0]);
      return { content: [{ type: 'text', text: code }] };
    }
    case 'validate_snippet': {
      const result = validateSnippet(args.code as string);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    }
    default:
      throw new Error(`Unknown tool: ${req.params.name}`);
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
