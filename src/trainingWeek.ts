import type { Day, Plan } from "./model";

const names = ["روز اول", "روز دوم", "روز سوم", "روز چهارم", "روز پنجم", "روز ششم", "روز هفتم"];
export const activeWeek = (plan: Plan) =>
  Array.from({ length: 7 }, (_, i) => Boolean(plan.schedule[i] && plan.schedule[i] !== "استراحت"));

export function assignTrainingWeek(days: Day[], selected: boolean[]) {
  const renamed = days.map((day, i) => ({ ...day, name: names[i] ?? `روز ${i + 1}` }));
  let session = 0;
  return {
    days: renamed,
    schedule: selected.map((active) => active ? renamed[session++]?.name ?? "استراحت" : "استراحت"),
  };
}

function weekdayAssignments(plan: Plan) {
  const used = new Set<string>();
  const assigned = new Map<number, Day>();
  activeWeek(plan).forEach((active, index) => {
    if (!active) return;
    const day = plan.days.find((day) => day.name === plan.schedule[index] && !used.has(day.id))
      ?? plan.days.find((day) => !used.has(day.id));
    if (day) { assigned.set(index, day); used.add(day.id); }
  });
  return { assigned, unassigned: plan.days.filter((day) => !used.has(day.id)) };
}

export const getWeekdaySession = (plan: Plan, index: number) => weekdayAssignments(plan).assigned.get(index);

export function resizeTrainingWeek(plan: Plan, selected: boolean[], createDay: () => Day) {
  const { assigned, unassigned } = weekdayAssignments(plan);
  const days: Day[] = [];
  selected.forEach((active, index) => {
    if (active) days.push(assigned.get(index) ?? unassigned.shift() ?? createDay());
  });
  // Preserve any old sessions that did not have a calendar assignment.
  return assignTrainingWeek([...days, ...unassigned], selected);
}
