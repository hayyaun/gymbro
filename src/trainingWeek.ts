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

export function resizeTrainingWeek(plan: Plan, selected: boolean[], createDay: () => Day) {
  const count = selected.filter(Boolean).length;
  const days = plan.days.slice(0, count);
  while (days.length < count) days.push(createDay());
  return assignTrainingWeek(days, selected);
}
