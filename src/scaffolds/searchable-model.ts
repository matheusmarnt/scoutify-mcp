interface SearchableModelOptions {
  className: string;
  fields: string[];
  titleField: string;
  subtitleField: string;
  routeName: string;
  typeKey: string;
}

export function scaffoldSearchableModel(opts: SearchableModelOptions): string {
  const { className, fields, titleField, subtitleField, routeName, typeKey } = opts;
  const fieldLines = fields.map((f) => `            '${f}' => $this->${f},`).join('\n');

  return `<?php

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Model;
use Laravel\\Scout\\Searchable;
use Matheusmarnt\\Scoutify\\Contracts\\GloballySearchable;

class ${className} extends Model implements GloballySearchable
{
    use Searchable;

    public function toSearchableArray(): array
    {
        return [
${fieldLines}
        ];
    }

    public function globalSearchResult(): array
    {
        return [
            'title' => $this->${titleField},
            'subtitle' => $this->${subtitleField},
            'url' => route('${routeName}', $this),
            'type' => '${typeKey}',
        ];
    }
}
`;
}

export function searchableModelInstructions(opts: SearchableModelOptions): string {
  return `Add to your ScoutifyServiceProvider boot():

Scoutify::types()->register(
    ${opts.className}::class,
    '${opts.typeKey}',
    'heroicon-o-document-text',
    \\Matheusmarnt\\Scoutify\\Enums\\Color::Blue
);`;
}
