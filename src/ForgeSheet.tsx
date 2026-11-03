import { Activity, BicepsFlexed, Brain, CalendarDays, Dumbbell, Flame, HeartPulse, MoveUpRight, ShieldCheck, Target, Zap } from "lucide-react";
import type { CSSProperties } from "react";
import type { Plan } from "./model";
import { forgeVariables } from "./forgeTheme";
import WorkoutDays from "./WorkoutDays";
import "./ForgeSheet.css";

const pillars = [
  { icon: BicepsFlexed, title: "بدن قدرتمند", text: "با هر تکرار، یک قدم جلوتر" },
  { icon: Zap, title: "انرژی و قدرت", text: "تمرین با تمرکز و هدف" },
  { icon: Target, title: "مسیر مشخص", text: "پیوسته، منظم، رو به پیشرفت" },
  { icon: Brain, title: "ذهن آماده", text: "تعهد به بهترین نسخه خودت" },
];

export default function ForgeSheet({ plan, coach, weekdays }: { plan: Plan; coach: string; weekdays: string[] }) {
  const mode = plan.forgeMode ?? "dark";
  return (
    <article className={`plan-sheet template-forge forge-${mode}`} style={forgeVariables(plan.forgeAccent, mode) as CSSProperties} dir="rtl">
      <header className="forge-hero">
        <div className="forge-coach-line">
          <span className="forge-gym"><Dumbbell size={22} /> باشگاه اکسیر</span>
          <span>برنامه اختصاصی · مربی: <b>{coach || "نام مربی"}</b></span>
        </div>
        <div className="forge-hero-copy">
          <span className="forge-kicker">برای ساختن خودت</span>
          <h2>قوی تر<br /><em>از دیروز.</em></h2>
          <p>{plan.title || "برنامه تمرینی شما"}</p>
          <div className="forge-hero-facts">
            <span><b>{plan.days.length.toLocaleString("fa-IR")}</b> روز تمرین</span>
            <span><b>{plan.weeks}</b> هفته تلاش</span>
            <span><Flame size={16} /> {plan.goal}</span>
          </div>
        </div>
        <div className="forge-hero-art" aria-hidden="true">
          <div className="forge-energy" />
          <img src={`${import.meta.env.BASE_URL}forge-athlete.png`} alt="" />
        </div>
        <div className="forge-athlete-tag"><span>ورزشکار</span><b>{plan.athlete || "نام ورزشکار"}</b><MoveUpRight size={22} /></div>
      </header>

      <div className="forge-body">
        <section className="forge-pillars" aria-label="روحیه تمرین">
          {pillars.map(({ icon: Icon, title, text }) => (
            <div key={title}><Icon size={29} /><span><b>{title}</b><small>{text}</small></span></div>
          ))}
        </section>

        <section className="forge-workouts">
          <div className="forge-section-heading"><span><Dumbbell size={20} /> برنامه تمرینی</span><small>{plan.days.length.toLocaleString("fa-IR")} جلسه در هفته · {plan.goal}</small></div>
          <WorkoutDays plan={plan} />
        </section>

        <div className="forge-rhythm" aria-label="تمرکز تمرین">
          <span><Activity /><b>فرم صحیح</b><small>کیفیت در هر تکرار</small></span>
          <span><Target /><b>تمرکز کامل</b><small>هر حرکت با هدف</small></span>
          <span><ShieldCheck /><b>پیشرفت پیوسته</b><small>متعهد به برنامه</small></span>
          <span><HeartPulse /><b>ریکاوری</b><small>بخشی از مسیر پیشرفت</small></span>
        </div>

        <div className={`forge-lower${plan.cardio ? " with-cardio" : ""}`}>
          <section className="forge-calendar">
            <h3><CalendarDays /> تقویم هفتگی</h3>
            <div>{weekdays.map((day, i) => (
              <span key={day} className={plan.schedule[i] !== "استراحت" ? "training" : ""}><b>{day}</b><small>{plan.schedule[i]}</small></span>
            ))}</div>
          </section>
          {plan.cardio && <section className="forge-cardio"><h3><HeartPulse /> تمرین هوازی</h3><p>{plan.cardio}</p></section>}
        </div>
        {plan.notes && <section className="forge-notes"><div><Brain /><h3>با ذهن قوی،<br /><em>بدن قوی بساز.</em></h3></div><span><b>یادداشت مربی</b><p>{plan.notes}</p></span></section>}
      </div>
      <footer><b>باشگاه اکسیر</b><span>مربی: {coach || "نام مربی"}</span><strong>هر روز، یک قدم قوی تر <MoveUpRight size={20} /></strong></footer>
    </article>
  );
}
