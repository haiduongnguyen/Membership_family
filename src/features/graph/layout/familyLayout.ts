import type { Person, Relationship } from "@/lib/models";

export type GraphPoint = {
  id: string;
  x: number;
  y: number;
};

function relationDelta(relationType: Relationship["relation_type"]) {
  if (relationType === "father" || relationType === "mother" || relationType === "grandparent" || relationType === "manager") {
    return 1;
  }
  if (relationType === "child" || relationType === "employee") {
    return -1;
  }
  return 0;
}

function calcGeneration(rootId: string, people: Person[], rels: Relationship[]) {
  const levels = new Map<string, number>([[rootId, 0]]);
  const queue = [rootId];
  const bySource = new Map<string, Relationship[]>();
  const byTarget = new Map<string, Relationship[]>();

  for (const rel of rels) {
    const sourceList = bySource.get(rel.source_person_id) ?? [];
    sourceList.push(rel);
    bySource.set(rel.source_person_id, sourceList);

    const targetList = byTarget.get(rel.target_person_id) ?? [];
    targetList.push(rel);
    byTarget.set(rel.target_person_id, targetList);
  }

  while (queue.length) {
    const current = queue.shift() as string;
    const level = levels.get(current) ?? 0;

    for (const rel of bySource.get(current) ?? []) {
      if (levels.has(rel.target_person_id)) continue;
      levels.set(rel.target_person_id, level + relationDelta(rel.relation_type));
      queue.push(rel.target_person_id);
    }

    for (const rel of byTarget.get(current) ?? []) {
      if (levels.has(rel.source_person_id)) continue;
      levels.set(rel.source_person_id, level - relationDelta(rel.relation_type));
      queue.push(rel.source_person_id);
    }
  }

  for (const p of people) {
    if (!levels.has(p.id)) levels.set(p.id, 0);
  }

  return levels;
}

function buildNeighborsByPersonId(relationships: Relationship[]) {
  const neighbors = new Map<string, Set<string>>();
  for (const rel of relationships) {
    const a = neighbors.get(rel.source_person_id) ?? new Set<string>();
    a.add(rel.target_person_id);
    neighbors.set(rel.source_person_id, a);

    const b = neighbors.get(rel.target_person_id) ?? new Set<string>();
    b.add(rel.source_person_id);
    neighbors.set(rel.target_person_id, b);
  }
  return neighbors;
}

function reorderLevelByBarycenter(
  row: Person[],
  neighborOrder: Map<string, number>,
  neighborsByPersonId: Map<string, Set<string>>,
) {
  return row.slice().sort((a, b) => {
    const aNeighbors = [...(neighborsByPersonId.get(a.id) ?? new Set<string>())];
    const bNeighbors = [...(neighborsByPersonId.get(b.id) ?? new Set<string>())];

    const aVals = aNeighbors.map((id) => neighborOrder.get(id)).filter((v): v is number => typeof v === "number");
    const bVals = bNeighbors.map((id) => neighborOrder.get(id)).filter((v): v is number => typeof v === "number");

    const aAvg = aVals.length ? aVals.reduce((sum, x) => sum + x, 0) / aVals.length : Number.MAX_SAFE_INTEGER;
    const bAvg = bVals.length ? bVals.reduce((sum, x) => sum + x, 0) / bVals.length : Number.MAX_SAFE_INTEGER;

    if (aAvg !== bAvg) return aAvg - bAvg;
    return a.full_name.localeCompare(b.full_name, "vi");
  });
}

export function buildFamilyLayout(people: Person[], relationships: Relationship[], rootPersonId?: string | null): GraphPoint[] {
  if (!people.length) return [];

  const rootId = rootPersonId ?? people[0].id;
  const levels = calcGeneration(rootId, people, relationships);
  const byLevel = new Map<number, Person[]>();
  const neighborsByPersonId = buildNeighborsByPersonId(relationships);

  for (const person of people) {
    const level = levels.get(person.id) ?? 0;
    const list = byLevel.get(level) ?? [];
    list.push(person);
    byLevel.set(level, list);
  }

  const sortedLevels = Array.from(byLevel.keys()).sort((a, b) => b - a);
  const orderedRows = new Map<number, Person[]>();

  for (let i = 0; i < sortedLevels.length; i += 1) {
    const level = sortedLevels[i];
    const row = byLevel.get(level) ?? [];
    if (i === 0) {
      orderedRows.set(level, row.slice().sort((a, b) => a.full_name.localeCompare(b.full_name, "vi")));
      continue;
    }
    const prevLevel = sortedLevels[i - 1];
    const prevRow = orderedRows.get(prevLevel) ?? [];
    const prevOrder = new Map<string, number>(prevRow.map((person, idx) => [person.id, idx]));
    orderedRows.set(level, reorderLevelByBarycenter(row, prevOrder, neighborsByPersonId));
  }

  const points: GraphPoint[] = [];
  const topLevel = sortedLevels[0];
  for (const level of sortedLevels) {
    const row = orderedRows.get(level) ?? [];
    row.forEach((person, idx) => {
      points.push({
        id: person.id,
        x: idx * 230,
        y: (topLevel - level) * 170,
      });
    });
  }

  return points;
}

