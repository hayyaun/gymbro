import type { Plan } from "./model";

export const studentKey = (name: string) =>
  name.trim().replace(/\s+/g, " ").replace(/[يى]/g, "ی").replace(/ك/g, "ک");

export function studentsFromPlans(plans: Plan[]) {
  const students = new Map<string, { name: string; count: number }>();
  for (const plan of plans) {
    const name = studentKey(plan.athlete);
    if (!name) continue;
    const student = students.get(name);
    if (student) student.count++;
    else students.set(name, { name, count: 1 });
  }
  return [...students.values()].sort((a, b) => a.name.localeCompare(b.name, "fa"));
}
