import type { Plan } from "./model";
import { faNumber, isDate, isExercisePlaceholder, planDatesError } from "./library.ts";

export type PlanSaveIssue = {
  tab: "details" | "workout";
  fieldId: string;
  message: string;
  dayId?: string;
};

const requiredExerciseFields = [
  ["name", "نام حرکت"],
  ["sets", "ست"],
  ["reps", "تکرار"],
  ["rest", "استراحت"],
] as const;

export function preparePlanForSave(draft: Plan): { plan: Plan } | { issue: PlanSaveIssue } {
  const detailsIssue = (fieldId: string, message: string) => ({
    issue: { tab: "details" as const, fieldId, message },
  });
  const dateError = planDatesError(draft);
  if (dateError) {
    return detailsIssue(draft.startDate && !isDate(draft.startDate) ? "plan-start-date" : "plan-end-date", dateError);
  }
  if (!draft.title.trim()) return detailsIssue("plan-title", "نام برنامه را وارد کنید");
  if (!draft.athlete.trim()) return detailsIssue("plan-athlete", "نام ورزشکار را وارد کنید");
  const weeks = Number(draft.weeks);
  if (!Number.isFinite(weeks) || weeks < 1 || weeks > 52) {
    return detailsIssue("plan-weeks", "مدت برنامه را بین ۱ تا ۵۲ هفته وارد کنید");
  }
  if (!draft.days.length) return detailsIssue("plan-first-weekday", "حداقل یک روز تمرین انتخاب کنید");

  const days = draft.days.map((day, index) => ({
    ...day,
    name: day.name.trim() ? day.name : `جلسه ${faNumber(index + 1)}`,
    exercises: day.exercises.filter((exercise) => !isExercisePlaceholder(exercise)),
  }));
  for (const [dayIndex, day] of days.entries()) {
    const session = `جلسه ${faNumber(dayIndex + 1)}`;
    if (!day.exercises.length) {
      const first = draft.days[dayIndex].exercises[0];
      return { issue: {
        tab: "workout",
        dayId: day.id,
        fieldId: first ? `exercise-${first.id}-name` : `day-${day.id}-add-exercise`,
        message: `برای ${session} حداقل یک حرکت وارد کنید`,
      } };
    }
    const originalExercises = draft.days[dayIndex].exercises;
    for (const exercise of day.exercises) {
      const missing = requiredExerciseFields.find(([key]) => !exercise[key].trim());
      if (!missing) continue;
      const [key, label] = missing;
      const number = faNumber(originalExercises.findIndex(({ id }) => id === exercise.id) + 1);
      const movement = exercise.name.trim() || `حرکت ${number}`;
      return { issue: {
        tab: "workout",
        dayId: day.id,
        fieldId: `exercise-${exercise.id}-${key}`,
        message: key === "name" ? `${session}، نام حرکت ${number} را وارد کنید` : `${session}، ${label} «${movement}» را وارد کنید`,
      } };
    }
  }
  return { plan: { ...draft, days } };
}
