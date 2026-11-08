import { Activity, BicepsFlexed, Brain, CalendarDays, Dumbbell, Flame, HeartPulse, MoveUpRight, ShieldCheck, Target, Zap } from "lucide-react";
import type { CSSProperties } from "react";
import type { Plan } from "./model";
import PlanDates from "./PlanDates";
import { defaultForgeSlogan, forgeVariables } from "./forgeTheme";
import WorkoutDays from "./WorkoutDays";
import TrainingSystemLegend from "./TrainingSystemLegend";
import { orderedSheetSections, showsSheetSection } from "./sheetSections";
import { renderSheetSections } from "./renderSheetSections";
import "./ForgeSheet.css";

const pillars = [
  { icon: BicepsFlexed, title: "بدن قدرتمند", text: "با هر تکرار، یک قدم جلوتر" },
  { icon: Zap, title: "انرژی و قدرت", text: "تمرین با تمرکز و هدف" },
  { icon: Target, title: "مسیر مشخص", text: "پیوسته، منظم، رو به پیشرفت" },
  { icon: Brain, title: "ذهن آماده", text: "تعهد به بهترین نسخه خودت" },
];

export default function ForgeSheet({ plan, coach, weekdays }: { plan: Plan; coach: string; weekdays: string[] }) {
  const mode = plan.forgeMode ?? "dark";
  const [sloganLead, ...sloganAccent] = (plan.forgeSlogan?.trim() || defaultForgeSlogan).split(/\r?\n/);
  const showCalendar = showsSheetSection(plan, "calendar");
  const showCardio = plan.cardio && showsSheetSection(plan, "cardio");
  return (
    <article className={`plan-sheet template-forge forge-${mode}`} style={forgeVariables(plan.forgeAccent, mode) as CSSProperties} dir="rtl">
      <header className="forge-hero">
        <div className="forge-coach-line">
          <span className="forge-gym"><Dumbbell size={22} /> باشگاه اکسیر</span>
          <span>برنامه اختصاصی · مربی: <b>{coach || "نام مربی"}</b></span>
        </div>
        <div className="forge-hero-copy">
          <span className="forge-kicker">برای ساختن خودت</span>
          <h2>{sloganLead}{sloganAccent.length > 0 && <><br /><em>{sloganAccent.join("\n")}</em></>}</h2>
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
      <PlanDates plan={plan} />

      {renderSheetSections(plan, {
        pillars: showsSheetSection(plan, "pillars") && <section className="forge-pillars" aria-label="روحیه تمرین">
          {pillars.map(({ icon: Icon, title, text }) => (
            <div key={title}><Icon size={29} /><span><b>{title}</b><small>{text}</small></span></div>
          ))}
        </section>,

        workouts: <section className="forge-workouts">
          <div className="forge-section-heading"><span><Dumbbell size={20} /> برنامه تمرینی</span><small>{plan.days.length.toLocaleString("fa-IR")} جلسه در هفته · {plan.goal}</small></div>
          <WorkoutDays plan={plan} />
        </section>,

        rhythm: showsSheetSection(plan, "rhythm") && <div className="forge-rhythm" aria-label="تمرکز تمرین">
          <span><Activity /><b>فرم صحیح</b><small>کیفیت در هر تکرار</small></span>
          <span><Target /><b>تمرکز کامل</b><small>هر حرکت با هدف</small></span>
          <span><ShieldCheck /><b>پیشرفت پیوسته</b><small>متعهد به برنامه</small></span>
          <span><HeartPulse /><b>ریکاوری</b><small>بخشی از مسیر پیشرفت</small></span>
        </div>,

        calendar: showCalendar && <section className="forge-calendar">
          <h3><CalendarDays /> تقویم هفتگی</h3>
          <div>{weekdays.map((day, i) => (
            <span key={day} className={plan.schedule[i] !== "استراحت" ? "training" : ""}><b>{day}</b><small>{plan.schedule[i]}</small></span>
          ))}</div>
        </section>,
        cardio: showCardio && <section className="forge-cardio"><h3><HeartPulse /> تمرین هوازی</h3><p>{plan.cardio}</p></section>,
        legend: <TrainingSystemLegend plan={plan} />,
        notes: plan.notes && showsSheetSection(plan, "notes") && <section className="forge-notes"><div><Brain /><h3>با ذهن قوی،<br /><em>بدن قوی بساز.</em></h3></div><span><b>یادداشت مربی</b><p>{plan.notes}</p></span></section>,
        footer: showsSheetSection(plan, "footer") && <footer><b>باشگاه اکسیر</b><span>مربی: {coach || "نام مربی"}</span><strong>هر روز، یک قدم قوی تر <MoveUpRight size={20} /></strong></footer>,
      }, [{
        members: orderedSheetSections(plan).filter((section) => section !== "footer"),
        wrap: (children) => <div className="forge-body">{children}</div>,
        groups: [{
          members: ["calendar", "cardio"],
          wrap: (children, order) => <div className={`forge-lower${order.length === 2 ? " with-cardio" : ""}`}
            style={order.length === 2 && order[0] === "cardio" ? { gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.8fr)" } : undefined}>
            {children}
          </div>,
        }],
      }])}
    </article>
  );
}
