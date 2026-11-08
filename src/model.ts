import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ForgeAccent, ForgeMode } from "./forgeTheme";
import type { ProtocolAccent, ProtocolMode } from "./protocolTheme";
import { linkStudents, updateStudent } from "./library";
import type { Student, WorkoutBlock } from "./library";
import { restoreData } from "./backup";
import type { LibraryData, RestoreMode } from "./backup";
import type { TrainingSystem } from "./trainingSystems";
import { defaultSheetTemplate, orderedSheetSections, sheetSectionOptions, sheetTemplate, sheetTemplates } from "./sheetSections";
import type { HiddenSheetSections, SheetSection, SheetSectionOrder, SheetTemplate } from "./sheetSections";

export type Exercise = {
  id: string;
  name: string;
  sets: string;
  reps: string;
  rest: string;
  note: string;
  group: string;
  trainingSystem?: TrainingSystem;
};
export type Day = {
  id: string;
  name: string;
  focus: string;
  exercises: Exercise[];
};
export type Plan = {
  id: string;
  title: string;
  athlete: string;
  studentId?: string;
  goal: string;
  weeks: string;
  startDate?: string;
  endDate?: string;
  template: SheetTemplate;
  color: string;
  forgeAccent?: ForgeAccent;
  forgeMode?: ForgeMode;
  forgeSlogan?: string;
  protocolAccent?: ProtocolAccent;
  protocolMode?: ProtocolMode;
  hiddenSections?: HiddenSheetSections;
  sectionOrder?: SheetSectionOrder;
  notes: string;
  cardio: string;
  schedule: string[];
  days: Day[];
  updatedAt: string;
};
export const uid = () => crypto.randomUUID();
export const exercise = (name = ""): Exercise => ({
  id: uid(),
  name,
  sets: "3",
  reps: "10–12",
  rest: "60",
  note: "",
  group: "",
});
export type PlanAppearance = Pick<Plan, "template" | "color" | "forgeAccent" | "forgeMode" | "protocolAccent" | "protocolMode" | "hiddenSections" | "sectionOrder">;
const planAppearance = ({ template, color, forgeAccent, forgeMode, protocolAccent, protocolMode, hiddenSections, sectionOrder }: PlanAppearance): PlanAppearance =>
  ({ template: sheetTemplate(template), color, forgeAccent, forgeMode, protocolAccent, protocolMode, hiddenSections, sectionOrder });

export const newPlan = (appearance?: PlanAppearance): Plan => ({
  id: uid(),
  title: "",
  athlete: "",
  goal: "عضله سازی",
  weeks: "6",
  template: defaultSheetTemplate,
  color: "#dc3045",
  ...(appearance && planAppearance(appearance)),
  notes: "",
  cardio: "",
  schedule: Array(7).fill("استراحت"),
  days: [],
  updatedAt: new Date().toISOString(),
});
const demo = (): Plan => ({
  ...newPlan(),
  id: "sample",
  title: "قدرت، در هر تکرار",
  athlete: "آرمان رضایی",
  notes:
    "قبل از شروع تمرین ۱۰ دقیقه گرم کنید. وزنه را با حفظ فرم صحیح افزایش دهید.",
  cardio: "۲ تا ۳ جلسه در هفته · ۲۰ دقیقه با شدت متوسط",
  schedule: [
    "روز اول",
    "روز دوم",
    "استراحت",
    "روز سوم",
    "روز چهارم",
    "استراحت",
    "استراحت",
  ],
  days: [
    {
      id: uid(),
      name: "روز اول",
      focus: "بالاتنه · تمرکز بر پشت",
      exercises: [
        "بارفیکس دستگاه",
        "زیربغل قایقی",
        "پرس بالا سینه دمبل",
        "لت تک دست",
        "نشر جانب سیم کش",
        "پشت بازو طناب",
      ].map(exercise),
    },
    {
      id: uid(),
      name: "روز دوم",
      focus: "پایین تنه · چهارسر ران",
      exercises: [
        "اسکوات هالتر",
        "پرس پا",
        "اسکوات بلغاری",
        "پشت پا دستگاه",
        "جلو پا دستگاه",
        "ساق پا ایستاده",
      ].map(exercise),
    },
    {
      id: uid(),
      name: "روز سوم",
      focus: "بالاتنه · سینه و سرشانه",
      exercises: [
        "پرس سینه اسمیت",
        "زیربغل سیم کش تک دست",
        "پرس سینه دستگاه",
        "لت دست جمع",
        "نشر جانب دمبل",
        "جلو بازو سیم کش",
      ].map(exercise),
    },
    {
      id: uid(),
      name: "روز چهارم",
      focus: "پایین تنه · زنجیره خلفی",
      exercises: [
        "ددلیفت رومانیایی",
        "هاک اسکوات",
        "هیپ تراست",
        "پشت پا خوابیده",
        "لانج راه رفتنی",
        "کرانچ سیم کش",
      ].map(exercise),
    },
  ],
});
type Store = {
  coach: string;
  plans: Plan[];
  students: Student[];
  blocks: WorkoutBlock[];
  defaultAppearance?: PlanAppearance;
  saveStudent: (student: Student) => void;
  saveBlock: (block: WorkoutBlock) => void;
  removeBlock: (id: string) => void;
  restoreLibrary: (data: LibraryData, mode: RestoreMode) => void;
  heroDismissed: boolean;
  dismissHero: () => void;
  setCoach: (name: string) => void;
  save: (plan: Plan) => void;
  remove: (id: string) => void;
};
export const useStore = create<Store>()(
  persist(
    (set) => ({
      coach: "",
      ...linkStudents([demo()], []),
      blocks: [],
      heroDismissed: false,
      dismissHero: () => set({ heroDismissed: true }),
      setCoach: (coach) => set({ coach }),
      save: (plan) =>
        set((s) => {
          const previous = s.plans.find((item) => item.id === plan.id);
          let defaultAppearance = s.defaultAppearance;
          if (!previous) {
            defaultAppearance = planAppearance(plan);
          } else {
            const changedSections: HiddenSheetSections = {};
            const changedOrder: SheetSectionOrder = {};
            for (const template of sheetTemplates) {
              const beforeOrder = orderedSheetSections({ ...previous, template });
              const afterOrder = orderedSheetSections({ ...plan, template });
              if (afterOrder.some((section, index) => section !== beforeOrder[index])) {
                changedOrder[template] = afterOrder;
              }
              const options: readonly SheetSection[] = sheetSectionOptions[template];
              const before = previous.hiddenSections?.[template] ?? [];
              const after = plan.hiddenSections?.[template] ?? [];
              const changed = options.filter((section) => before.includes(section) !== after.includes(section));
              if (!changed.length) continue;

              const remembered = defaultAppearance ? (defaultAppearance.hiddenSections?.[template] ?? []) : before;
              changedSections[template] = options.filter((section) =>
                (changed.includes(section) ? after : remembered).includes(section),
              );
            }
            if (Object.keys(changedSections).length || Object.keys(changedOrder).length) {
              const appearance = defaultAppearance ?? planAppearance(plan);
              defaultAppearance = {
                ...appearance,
                hiddenSections: { ...appearance.hiddenSections, ...changedSections },
                sectionOrder: { ...appearance.sectionOrder, ...changedOrder },
              };
            }
          }
          return {
            ...linkStudents([plan, ...s.plans.filter((item) => item.id !== plan.id)], s.students),
            defaultAppearance,
          };
        }),
      saveStudent: (student) => set((s) => updateStudent(s.plans, s.students, student)),
      saveBlock: (block) => set((s) => ({ blocks: [block, ...s.blocks.filter((item) => item.id !== block.id)] })),
      removeBlock: (id) => set((s) => ({ blocks: s.blocks.filter((item) => item.id !== id) })),
      restoreLibrary: (data, mode) => set((s) => ({ defaultAppearance: undefined, ...restoreData(s, data, mode) })),
      remove: (id) =>
        set((s) => ({ plans: s.plans.filter((p) => p.id !== id) })),
    }),
    {
      name: "gymbro-v1",
      merge: (persisted, current) => {
        const saved = persisted as Partial<Store> | undefined;
        const normalizedPlans = (saved?.plans ?? current.plans).map((plan) => ({
          ...plan,
          athlete: plan.athlete === "ایمان قهرمانی" || (plan.id === "sample" && plan.athlete === "ورزشکار نمونه") ? "آرمان رضایی" : plan.athlete,
          template: sheetTemplate(plan.template),
        }));
        return {
          ...current,
          ...saved,
          // Remove the original reference athlete from saved plans and copies.
          coach: saved?.coach === "ایمان قهرمانی" ? "مربی" : (saved?.coach ?? current.coach),
          defaultAppearance: saved?.defaultAppearance && planAppearance(saved.defaultAppearance),
          ...linkStudents(normalizedPlans, saved?.students ?? []),
        };
      },
    },
  ),
);
