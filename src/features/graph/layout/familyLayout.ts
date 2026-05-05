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

export function buildFamilyLayout(people: Person[], relationships: Relationship[], rootPersonId?: string | null): GraphPoint[] {
  if (!people.length) return [];

  const rootId = rootPersonId ?? people[0].id;
  const levels = calcGeneration(rootId, people, relationships);
  const byLevel = new Map<number, Person[]>();

  for (const person of people) {
    const level = levels.get(person.id) ?? 0;
    const list = byLevel.get(level) ?? [];
    list.push(person);
    byLevel.set(level, list);
  }

  const points: GraphPoint[] = [];
  const sortedLevels = Array.from(byLevel.keys()).sort((a, b) => b - a);

  for (const level of sortedLevels) {
    const row = (byLevel.get(level) ?? []).slice().sort((a, b) => a.full_name.localeCompare(b.full_name, "vi"));
    row.forEach((person, idx) => {
      points.push({
        id: person.id,
        x: idx * 220,
        y: (sortedLevels[0] - level) * 150,
      });
    });
  }

  return points;
}

