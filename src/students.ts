import type { Plan } from "./model";
import type { Student } from "./library";
export { studentKey } from "./library";

export function studentsFromPlans(plans: Plan[], students: Student[]) {
  return students.map((student) => ({ ...student, count: plans.filter((plan) => plan.studentId === student.id).length }))
    .sort((a, b) => a.name.localeCompare(b.name, "fa"));
}
