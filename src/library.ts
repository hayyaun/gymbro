import type { Exercise, Plan } from "./model";

export type Payment = {
  id: string;
  amount: number;
  date: string;
  period: string;
  method: "card" | "cash" | "transfer";
  note: string;
};
export type Student = {
  id: string;
  name: string;
  goal: string;
  equipment: string;
  notes: string;
  payments: Payment[];
  createdAt: string;
  updatedAt: string;
};
export type WorkoutBlock = {
  id: string;
  name: string;
  focus: string;
  exercises: Exercise[];
  updatedAt: string;
};
export const studentKey = (name: string) =>
  name.trim().replace(/\s+/g, " ").replace(/[يى]/g, "ی").replace(/ك/g, "ک");

export function makeStudent(name = "", id = crypto.randomUUID() as string): Student {
  const now = new Date().toISOString();
  return { id, name: studentKey(name), goal: "", equipment: "", notes: "", payments: [], createdAt: now, updatedAt: now };
}

// Old name-only plans acquire profiles once, without changing any workouts.
export function linkStudents(plans: Plan[], existing: Student[]) {
  const students = existing.map((student) => ({ ...student }));
  const linkedPlans = plans.map((plan) => {
    let student = students.find((item) => item.id === plan.studentId);
    if (!student) student = students.find((item) => studentKey(item.name) === studentKey(plan.athlete));
    if (!student && studentKey(plan.athlete)) {
      student = makeStudent(plan.athlete, `legacy:${studentKey(plan.athlete)}`);
      students.push(student);
    }
    return student ? { ...plan, studentId: student.id, athlete: student.name } : plan;
  });
  return { students, plans: linkedPlans };
}

export function updateStudent(plans: Plan[], students: Student[], student: Student) {
  return {
    students: [student, ...students.filter((item) => item.id !== student.id)],
    plans: plans.map((plan) => plan.studentId === student.id ? { ...plan, athlete: student.name } : plan),
  };
}

export const today = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};
export function isDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
}
export const faNumber = (value: number) => value.toLocaleString("fa-IR");
export const faDate = (value: string) => new Date(`${value.slice(0, 10)}T12:00:00`).toLocaleDateString("fa-IR");

export const cloneExercises = (exercises: Exercise[]) => exercises.map((item) => ({ ...item, id: crypto.randomUUID() }));
export const isExercisePlaceholder = (item: Exercise) => !item.name.trim() && !item.note && !item.group && item.sets === "3" && item.reps === "10–12" && item.rest === "60";
export function trimTrailingPlaceholders(exercises: Exercise[]) {
  const result = [...exercises];
  while (result.length > 1 && isExercisePlaceholder(result[result.length - 1])) result.pop();
  return result;
}
export function insertBlockExercises(existing: Exercise[], incoming: Exercise[]) {
  const groups = new Set(existing.map((item) => item.group.trim()).filter(Boolean));
  const renamed = new Map<string, string>();
  for (const item of incoming) {
    const label = item.group.trim();
    if (!label || renamed.has(label)) continue;
    let next = label;
    let suffix = 2;
    while (groups.has(next)) next = `${label}${suffix++}`;
    groups.add(next); renamed.set(label, next);
  }
  return [...existing, ...cloneExercises(incoming).map((item) => ({ ...item, group: renamed.get(item.group.trim()) ?? "" }))];
}
