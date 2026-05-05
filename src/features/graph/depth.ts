import type { Relationship } from "@/lib/models";

export function findVisiblePersonIdsByDepth(
  relationships: Relationship[],
  rootPersonId: string | null,
  maxDepth: number,
): Set<string> {
  if (!rootPersonId) return new Set<string>();
  if (maxDepth < 0) return new Set<string>();

  const adjacency = new Map<string, string[]>();
  for (const rel of relationships) {
    const a = adjacency.get(rel.source_person_id) ?? [];
    a.push(rel.target_person_id);
    adjacency.set(rel.source_person_id, a);

    const b = adjacency.get(rel.target_person_id) ?? [];
    b.push(rel.source_person_id);
    adjacency.set(rel.target_person_id, b);
  }

  const visible = new Set<string>([rootPersonId]);
  const queue: Array<{ id: string; depth: number }> = [{ id: rootPersonId, depth: 0 }];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) break;
    if (current.depth >= maxDepth) continue;
    for (const next of adjacency.get(current.id) ?? []) {
      if (visible.has(next)) continue;
      visible.add(next);
      queue.push({ id: next, depth: current.depth + 1 });
    }
  }

  return visible;
}

