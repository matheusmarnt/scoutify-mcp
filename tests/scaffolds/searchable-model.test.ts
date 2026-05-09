import { describe, it, expect } from 'vitest';
import { scaffoldSearchableModel, searchableModelInstructions } from '../../src/scaffolds/searchable-model.js';

const OPTS = {
  className: 'Post',
  fields: ['title', 'body'],
  titleField: 'title',
  subtitleField: 'excerpt',
  routeName: 'posts.show',
  typeKey: 'post',
};

describe('scaffoldSearchableModel', () => {
  it('generates class implementing GloballySearchable', () => {
    const code = scaffoldSearchableModel(OPTS);
    expect(code).toContain('class Post extends Model implements GloballySearchable');
    expect(code).toContain('use Searchable;');
  });

  it('includes all specified fields in toSearchableArray', () => {
    const code = scaffoldSearchableModel(OPTS);
    expect(code).toContain("'title' => $this->title");
    expect(code).toContain("'body' => $this->body");
  });

  it('uses correct title and subtitle fields', () => {
    const code = scaffoldSearchableModel(OPTS);
    expect(code).toContain("'title' => $this->title,");
    expect(code).toContain("'subtitle' => $this->excerpt,");
  });

  it('never contains legacy config keys', () => {
    const code = scaffoldSearchableModel(OPTS);
    expect(code).not.toMatch(/'icon_prefix'\s*=>/);
    expect(code).not.toMatch(/'types'\s*=>\s*\[/);
  });
});

describe('searchableModelInstructions', () => {
  it('references Scoutify::types()->register()', () => {
    const instr = searchableModelInstructions(OPTS);
    expect(instr).toContain('Scoutify::types()->register(');
    expect(instr).toContain('Post::class');
  });
});
