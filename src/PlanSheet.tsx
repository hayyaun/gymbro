import type { Plan } from "./model";
import ExirBrand from "./ExirBrand";
import ForgeSheet from "./ForgeSheet";
import WorkoutDays from "./WorkoutDays";
import TrainingSystemLegend from "./TrainingSystemLegend";
import { showsSheetSection } from "./sheetSections";
import { renderSheetSections } from "./renderSheetSections";
import ProtocolSheet from "./ProtocolSheet";
import PosterSheet from "./PosterSheet";
import SheetTitle from "./SheetTitle";
export const weekdays = [
  "شنبه",
  "یکشنبه",
  "دوشنبه",
  "سه شنبه",
  "چهارشنبه",
  "پنجشنبه",
  "جمعه",
];

export default function PlanSheet({
  plan,
  coach,
}: {
  plan: Plan;
  coach: string;
}) {
  if (plan.template === "forge") {
    return <ForgeSheet plan={plan} coach={coach} weekdays={weekdays} />;
  }
  if (plan.template === "protocol") {
    return <ProtocolSheet plan={plan} coach={coach} weekdays={weekdays} />;
  }
  if (plan.template === "overdrive" || plan.template === "pahlavan") {
    return <PosterSheet plan={plan} coach={coach} weekdays={weekdays} variant={plan.template} />;
  }
  const showCalendar = showsSheetSection(plan, "calendar");
  const showCardio = plan.cardio && showsSheetSection(plan, "cardio");
  return (
    <article
      className="plan-sheet template-studio"
      style={{ "--accent": plan.color } as React.CSSProperties}
      dir="rtl"
    >
      <header className="sheet-head">
        <div className="sheet-heading">
          <span className="sheet-eyebrow">برنامه اختصاصی تمرین</span>
          <h2>{coach || "نام مربی"}</h2>
          <p><SheetTitle title={plan.title || "برنامه تمرینی شما"} /></p>
          <div className="sheet-head-details">
            <strong>{plan.days.length} روز تمرین</strong>
            <span>{plan.goal}</span>
            <span>{plan.weeks} هفته</span>
          </div>
        </div>
        <ExirBrand />
      </header>
      <div className="sheet-meta">
        <b>ورزشکار: {plan.athlete || "نام ورزشکار"}</b>
        <span>برنامه تمرینی اختصاصی · باشگاه اکسیر</span>
      </div>
      {renderSheetSections(plan, {
        workouts: <WorkoutDays plan={plan} />,
        legend: <TrainingSystemLegend plan={plan} />,
        calendar: showCalendar && <section className="sheet-schedule">
          <h3>تقویم هفتگی</h3>
          <div>
            {weekdays.map((day, i) => (
              <span key={day} className={plan.schedule[i] !== "استراحت" ? "training" : ""}><b>{day}</b><small>{plan.schedule[i]}</small></span>
            ))}
          </div>
        </section>,
        cardio: showCardio && <section className="sheet-cardio">
          <h3>تمرین هوازی</h3>
          <p>{plan.cardio}</p>
        </section>,
        notes: plan.notes && showsSheetSection(plan, "notes") && <div className="sheet-notes">
          <b>یادداشت مربی</b>
          <p>{plan.notes}</p>
        </div>,
        footer: showsSheetSection(plan, "footer") && <footer>
          <b>باشگاه اکسیر · EXIR GYM</b>
          <span>مربی: {coach || "نام مربی"}</span>
        </footer>,
      }, [{
        members: ["calendar", "cardio"],
        wrap: (children, order) => <div className={`sheet-bottom${order.length === 2 ? " has-cardio" : ""}`}
          style={order.length === 2 && order[0] === "cardio" ? { gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.7fr)" } : undefined}>
          {children}
        </div>,
      }])}
    </article>
  );
}
