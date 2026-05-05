import type { Relationship } from "@/lib/models";

export function findPathEdgeIds(
  relationships: Relationship[],
  startPersonId: string | null,
  targetPersonId: string | null,
): Set<string> {
  if (!startPersonId || !targetPersonId || startPersonId === targetPersonId) return new Set<string>();

  const adjacency = new Map<string, Array<{ neighbor: string; edgeId: string }>>();
  for (const rel of relationships) {
    if (!adjacency.has(rel.source_person_id)) adjacency.set(rel.source_person_id, []);
    if (!adjacency.has(rel.target_person_id)) adjacency.set(rel.target_person_id, []);
    adjacency.get(rel.source_person_id)?.push({ neighbor: rel.target_person_id, edgeId: rel.id });
    adjacency.get(rel.target_person_id)?.push({ neighbor: rel.source_person_id, edgeId: rel.id });
  }

  const queue: string[] = [startPersonId];
  const visited = new Set<string>([startPersonId]);
  const parent = new Map<string, { from: string; edgeId: string }>();

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) break;
    if (current === targetPersonId) break;

    for (const next of adjacency.get(current) ?? []) {
      if (visited.has(next.neighbor)) continue;
      visited.add(next.neighbor);
      parent.set(next.neighbor, { from: current, edgeId: next.edgeId });
      queue.push(next.neighbor);
    }
  }

  if (!parent.has(targetPersonId)) return new Set<string>();

  const pathEdgeIds = new Set<string>();
  let cursor = targetPersonId;
  while (cursor !== startPersonId) {
    const step = parent.get(cursor);
    if (!step) break;
    pathEdgeIds.add(step.edgeId);
    cursor = step.from;
  }
  return pathEdgeIds;
}

