interface SearchMatch {
  slug: string;
  title: string;
  url: string;
  snippet: string;
  score: number;
}

interface SearchResult {
  matches: Omit<SearchMatch, 'score'>[];
}

function slugToUrl(slug: string): string {
  return `https://matheusmarnt.github.io/scoutify/${slug}/`;
}

function extractSections(corpus: string): { slug: string; body: string }[] {
  const sections: { slug: string; body: string }[] = [];
  const parts = corpus.split(/\n(?=## [^\n]+\n)/);
  for (const part of parts) {
    const match = part.match(/^## ([^\n]+)\n([\s\S]*)$/);
    if (!match) continue;
    const slug = match[1].trim();
    if (slug.includes(' ') && !slug.includes('/')) continue;
    sections.push({ slug, body: match[2].trim() });
  }
  return sections;
}

export function searchDocs(
  corpus: string,
  { query, limit }: { query: string; limit: number }
): SearchResult {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const sections = extractSections(corpus);

  const scored: SearchMatch[] = sections.map(({ slug, body }) => {
    const haystack = (slug + ' ' + body).toLowerCase();
    const score = terms.reduce((acc, term) => {
      const matches = [...haystack.matchAll(new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'))];
      return acc + matches.length;
    }, 0);

    const firstMatchIdx = terms.reduce((best, term) => {
      const idx = haystack.indexOf(term);
      return idx !== -1 && idx < best ? idx : best;
    }, haystack.length);

    const snippetStart = Math.max(0, firstMatchIdx - 80);
    const snippet = body.slice(snippetStart, snippetStart + 200).replace(/\n/g, ' ').trim();

    const title = slug.split('/').pop() ?? slug;
    return { slug, title, url: slugToUrl(slug), snippet, score };
  });

  return {
    matches: scored
      .filter((m) => m.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(({ score: _, ...rest }) => rest),
  };
}
