import type { Person, Relationship } from "@/lib/models";

export type GraphPoint = {
  id: string;
  x: number;
  y: number;
};

function calcGeneration(rootId: string, people: Person[], rels: Relationship[]) {
  const levels = new Map<string, number>([[rootId, 0]]);
  const queue = [rootId];

  while (queue.length) {
    const current = queue.shift() as string;
    const level = levels.get(current) ?? 0;

    rels
      .filter((r) => r.source_person_id === current)
      .forEach((rel) => {
        if (!levels.has(rel.target_person_id)) {
          const delta =
            rel.relation_type === "child" || rel.relation_type === "employee"
              ? -1
              : rel.relation_type === "father" ||
                  rel.relation_type === "mother" ||
                  rel.relation_type === "manager" ||
                  rel.relation_type === "grandparent"
                ? 1
                : 0;
          levels.set(rel.target_person_id, level + delta);
          queue.push(rel.target_person_id);
        }
      });
  }

  for (const p of people) {
    if (!levels.has(p.id)) levels.set(p.id, 0);
  }

  return levels;
}

export function buildFamilyLayout(people: Person[], relationships: Relationship[]): GraphPoint[] {
  if (!people.length) return [];

  const levels = calcGeneration(people[0].id, people, relationships);
  const byLevel = new Map<number, Person[]>();

  people.forEach((person) => {
    const level = levels.get(person.id) ?? 0;
    const list = byLevel.get(level) ?? [];
    list.push(person);
    byLevel.set(level, list);
  });

  const points: GraphPoint[] = [];
  const sortedLevels = Array.from(byLevel.keys()).sort((a, b) => b - a);

  sortedLevels.forEach((level) => {
    const row = byLevel.get(level) ?? [];
    row.forEach((person, idx) => {
      points.push({
        id: person.id,
        x: idx * 220,
        y: (sortedLevels[0] - level) * 150,
      });
    });
  });

  return points;
}
