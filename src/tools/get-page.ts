export function getPage(corpus: string, slug: string): string | null {
  const marker = `\n## ${slug}\n`;
  const start = corpus.indexOf(marker);
  if (start === -1) return null;
  const bodyStart = start + marker.length;
  const nextSection = corpus.indexOf('\n## ', bodyStart);
  const body = nextSection === -1 ? corpus.slice(bodyStart) : corpus.slice(bodyStart, nextSection);
  return body.trim();
}
