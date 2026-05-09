interface Antipattern {
  id: string;
  severity: string;
  rule: string;
  why: string;
  fix?: string;
}

export function getAntipatterns(index: string): Antipattern[] {
  const section = index.match(/## Antipatterns[\s\S]*?\n([\s\S]*?)(?:\n## Page Index|$)/);
  if (!section) return [];
  const blocks = section[1].split(/\n### /);
  const patterns: Antipattern[] = [];
  for (const block of blocks) {
    if (!block.trim()) continue;
    const headerMatch = block.match(/^([a-z_]+) \(severity: ([^)]+)\)\n/);
    if (!headerMatch) continue;
    const [, id, severity] = headerMatch;
    const ruleMatch = block.match(/\*\*Rule:\*\* ([^\n]+)/);
    const whyMatch = block.match(/\*\*Why:\*\* ([^\n]+)/);
    const fixMatch = block.match(/\*\*Fix:\*\* ([^\n]+)/);
    patterns.push({
      id,
      severity,
      rule: ruleMatch?.[1] ?? '',
      why: whyMatch?.[1] ?? '',
      ...(fixMatch ? { fix: fixMatch[1] } : {}),
    });
  }
  return patterns;
}
