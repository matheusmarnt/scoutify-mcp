interface PageEntry {
  slug: string;
  title: string;
  url: string;
  group: string;
}

export function listPages(index: string): PageEntry[] {
  const indexSection = index.match(/## Page Index\n([\s\S]*?)(?:\n## |$)/);
  if (!indexSection) return [];
  const lines = indexSection[1].trim().split('\n');
  const entries: PageEntry[] = [];
  for (const line of lines) {
    const m = line.match(/^- \[([^\]]+)\]\(([^)]+)\)/);
    if (!m) continue;
    const [, title, url] = m;
    const urlPath = new URL(url).pathname.replace(/^\/scoutify\//, '').replace(/\/$/, '');
    const parts = urlPath.split('/');
    const group = parts.length > 1 ? parts.slice(0, -1).join('/') : 'root';
    entries.push({ slug: urlPath, title, url, group });
  }
  return entries;
}
