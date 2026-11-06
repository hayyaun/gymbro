import type { Day, Exercise, Plan, PlanAppearance } from "./model";
import { isDate, linkStudents } from "./library.ts";
import { trainingSystemIds } from "./trainingSystems.ts";
import { orderedSheetSections, sheetSectionOptions, sheetTemplate, sheetTemplates } from "./sheetSections.ts";
import type { HiddenSheetSections, SheetSection, SheetSectionOrder } from "./sheetSections";
import type { Payment, Student, WorkoutBlock } from "./library";

export type LibraryData = { coach: string; heroDismissed: boolean; plans: Plan[]; students: Student[]; blocks: WorkoutBlock[]; defaultAppearance?: PlanAppearance };
export type Backup = { format: "gymbro-backup"; version: 1; createdAt: string; data: LibraryData };
export type RestoreMode = "merge" | "replace";
export const MAX_BACKUP_BYTES = 10 * 1024 * 1024;
const invalid = () => { throw new Error("ساختار فایل پشتیبان معتبر نیست. هیچ اطلاعاتی وارد نشد."); };
const object = (value: unknown): Record<string, unknown> => value !== null && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : invalid();
const string = (value: unknown, max = MAX_BACKUP_BYTES): string => typeof value === "string" && value.length <= max ? value : invalid();
const id = (value: unknown) => { const result = string(value, 1000); return result.trim() ? result : invalid(); };
const bool = (value: unknown): boolean => typeof value === "boolean" ? value : invalid();
const timestamp = (value: unknown): string => {
  const result = string(value, 100);
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(result) && isDate(result.slice(0, 10)) && Number.isFinite(Date.parse(result)) ? result : invalid();
};
function choice<const T extends string>(value: unknown, choices: readonly T[]): T { return choices.includes(value as T) ? value as T : invalid(); }
function list<T>(value: unknown, parse: (value: unknown) => T, max = 10000): T[] { return Array.isArray(value) && value.length <= max ? value.map(parse) : invalid(); }
function unique<T extends { id: string }>(values: T[]): T[] { return new Set(values.map((value) => value.id)).size === values.length ? values : invalid(); }
function readExercise(value: unknown): Exercise {
  const item = object(value);
  return { id: id(item.id), name: string(item.name), sets: string(item.sets), reps: string(item.reps), rest: string(item.rest), note: string(item.note), group: string(item.group),
    ...(item.trainingSystem !== undefined && { trainingSystem: choice(item.trainingSystem, trainingSystemIds) }) };
}
function readDay(value: unknown): Day {
  const item = object(value);
  return { id: id(item.id), name: string(item.name), focus: string(item.focus), exercises: unique(list(item.exercises, readExercise, 5000)) };
}
function readAppearance(value: unknown): PlanAppearance {
  const item = object(value);
  const template = choice(item.template, [...sheetTemplates, "studio", "minimal", "bold"]);
  const color = string(item.color, 9);
  if (!/^#[\da-f]{6}$/i.test(color)) invalid();
  const appearance: PlanAppearance = { template: sheetTemplate(template), color };
  if (item.forgeAccent !== undefined) appearance.forgeAccent = choice(item.forgeAccent, ["purple", "orange", "lime", "yellow"]);
  if (item.forgeMode !== undefined) appearance.forgeMode = choice(item.forgeMode, ["dark", "light"]);
  if (item.protocolAccent !== undefined) appearance.protocolAccent = choice(item.protocolAccent, ["orange", "red", "purple", "cyan", "green"]);
  if (item.protocolMode !== undefined) appearance.protocolMode = choice(item.protocolMode, ["paper", "dark"]);
  if (item.hiddenSections !== undefined) {
    const source = object(item.hiddenSections);
    const hiddenSections: HiddenSheetSections = {};
    for (const template of sheetTemplates) {
      if (source[template] === undefined) continue;
      const options: readonly SheetSection[] = sheetSectionOptions[template];
      const hidden = list(source[template], (section) => choice(section, options), options.length);
      hiddenSections[template] = options.filter((section) => hidden.includes(section));
    }
    appearance.hiddenSections = hiddenSections;
  }
  if (item.sectionOrder !== undefined) {
    const source = object(item.sectionOrder);
    const sectionOrder: SheetSectionOrder = {};
    for (const template of sheetTemplates) {
      if (source[template] === undefined) continue;
      const options = orderedSheetSections({ template });
      const saved = list(source[template], (section) => choice(section, options), options.length);
      sectionOrder[template] = orderedSheetSections({ template, sectionOrder: { [template]: saved } });
    }
    appearance.sectionOrder = sectionOrder;
  }
  return appearance;
}
function readPlan(value: unknown): Plan {
  const item = object(value);
  const schedule = list(item.schedule, (entry) => string(entry), 7);
  if (schedule.length !== 7) invalid();
  const plan: Plan = { id: id(item.id), title: string(item.title), athlete: string(item.athlete), goal: string(item.goal), weeks: string(item.weeks), ...readAppearance(item),
    cardio: string(item.cardio), notes: string(item.notes), schedule, days: unique(list(item.days, readDay, 365)), updatedAt: timestamp(item.updatedAt) };
  if (item.studentId !== undefined) plan.studentId = id(item.studentId);
  if (item.forgeSlogan !== undefined) plan.forgeSlogan = string(item.forgeSlogan);
  return plan;
}
function readPayment(value: unknown): Payment {
  const item = object(value); const date = string(item.date, 10);
  if (!isDate(date) || !Number.isSafeInteger(item.amount) || (item.amount as number) <= 0 || (item.amount as number) > 1000000000000) invalid();
  return { id: id(item.id), amount: item.amount as number, date, period: string(item.period), method: choice(item.method, ["card", "cash", "transfer"]), note: string(item.note) };
}
function readStudent(value: unknown): Student {
  const item = object(value); const name = string(item.name);
  if (!name.trim()) invalid();
  const payments = unique(list(item.payments, readPayment));
  if (!Number.isSafeInteger(payments.reduce((total, payment) => total + payment.amount, 0))) invalid();
  return { id: id(item.id), name, goal: string(item.goal), equipment: string(item.equipment), notes: string(item.notes), payments, createdAt: timestamp(item.createdAt), updatedAt: timestamp(item.updatedAt) };
}
function readBlock(value: unknown): WorkoutBlock {
  const item = object(value);
  return { id: id(item.id), name: string(item.name), focus: string(item.focus), exercises: unique(list(item.exercises, readExercise, 5000)), updatedAt: timestamp(item.updatedAt) };
}
export function parseBackup(text: string): Backup {
  if (new TextEncoder().encode(text).length > MAX_BACKUP_BYTES) throw new Error("حجم فایل بیشتر از ۱۰ مگابایت است.");
  let raw: unknown;
  try { raw = JSON.parse(text); } catch { throw new Error("فایل JSON خوانده نشد. یک فایل پشتیبان جیم برو انتخاب کنید."); }
  const source = object(raw);
  if (source.format !== "gymbro-backup") throw new Error("این فایل پشتیبان جیم برو نیست.");
  if (source.version !== 1) throw new Error("نسخه این فایل پشتیبان پشتیبانی نمی شود. برنامه را به روز کنید.");
  const data = object(source.data);
  const students = unique(list(data.students, readStudent));
  const plans = unique(list(data.plans, readPlan));
  const blocks = unique(list(data.blocks, readBlock));
  if (plans.some((plan) => plan.studentId && !students.some((student) => student.id === plan.studentId))) invalid();
  const defaultAppearance = data.defaultAppearance === undefined ? undefined : readAppearance(data.defaultAppearance);
  return { format: "gymbro-backup", version: 1, createdAt: timestamp(source.createdAt), data: { coach: string(data.coach), heroDismissed: bool(data.heroDismissed), blocks, ...linkStudents(plans, students), ...(defaultAppearance && { defaultAppearance }) } };
}
export function makeBackup(data: LibraryData): Backup {
  // Whitelist data fields: actions, file paths, and assets never enter a backup.
  return { format: "gymbro-backup", version: 1, createdAt: new Date().toISOString(), data: structuredClone({ coach: data.coach, heroDismissed: data.heroDismissed, plans: data.plans, students: data.students, blocks: data.blocks, ...(data.defaultAppearance && { defaultAppearance: data.defaultAppearance }) }) };
}
const keepLocal = <T extends { id: string }>(current: T[], incoming: T[]) => [...current, ...incoming.filter((item) => !current.some((local) => local.id === item.id))];
export function restoreData(current: LibraryData, incoming: LibraryData, mode: RestoreMode): LibraryData {
  if (mode === "replace") return structuredClone(incoming);
  const students = keepLocal(current.students, incoming.students).map((student) => {
    const imported = incoming.students.find((item) => item.id === student.id);
    return imported ? { ...student, payments: keepLocal(student.payments, imported.payments) } : student;
  });
  if (students.some((student) => !Number.isSafeInteger(student.payments.reduce((total, payment) => total + payment.amount, 0)))) invalid();
  const linked = linkStudents(keepLocal(current.plans, incoming.plans), students);
  const defaultAppearance = current.defaultAppearance ?? incoming.defaultAppearance;
  return structuredClone({ coach: current.coach || incoming.coach, heroDismissed: current.heroDismissed, blocks: keepLocal(current.blocks, incoming.blocks), ...linked, ...(defaultAppearance && { defaultAppearance }) });
}
export function downloadBackup(data: LibraryData) {
  const backup = makeBackup(data);
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a"); anchor.href = url; anchor.download = `gymbro-backup-${backup.createdAt.slice(0, 10)}.json`; anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
