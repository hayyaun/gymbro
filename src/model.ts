import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Exercise = {
  id: string;
  name: string;
  sets: string;
  reps: string;
  rest: string;
  note: string;
  group: string;
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
  goal: string;
  weeks: string;
  template: string;
  color: string;
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
export const newPlan = (): Plan => ({
  id: uid(),
  title: "",
  athlete: "",
  goal: "عضله سازی",
  weeks: "6",
  template: "studio",
  color: "#dc3045",
  notes: "",
  cardio: "",
  schedule: Array(7).fill("استراحت"),
  days: [
    { id: uid(), name: "روز اول", focus: "بالاتنه", exercises: [exercise()] },
  ],
  updatedAt: new Date().toISOString(),
});
const demo = (): Plan => ({
  ...newPlan(),
  id: "sample",
  title: "قدرت، در هر تکرار",
  athlete: "ورزشکار نمونه",
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
  setCoach: (name: string) => void;
  save: (plan: Plan) => void;
  remove: (id: string) => void;
};
export const useStore = create<Store>()(
  persist(
    (set) => ({
      coach: "",
      plans: [demo()],
      setCoach: (coach) => set({ coach }),
      save: (plan) =>
        set((s) => ({
          plans: [plan, ...s.plans.filter((p) => p.id !== plan.id)],
        })),
      remove: (id) =>
        set((s) => ({ plans: s.plans.filter((p) => p.id !== id) })),
    }),
    {
      name: "gymbro-v1",
      merge: (persisted, current) => {
        const saved = persisted as Partial<Store> | undefined;
        return {
          ...current,
          ...saved,
          // Replace only the original sample name; preserve customized plans.
          plans: (saved?.plans ?? current.plans).map((plan) =>
            plan.id === "sample" && plan.athlete === "ایمان قهرمانی"
              ? { ...plan, athlete: "ورزشکار نمونه" }
              : plan,
          ),
        };
      },
    },
  ),
);
