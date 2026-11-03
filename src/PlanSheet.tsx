import type { Plan } from "./model";
import ExirBrand from "./ExirBrand";
import ForgeSheet from "./ForgeSheet";
import WorkoutDays from "./WorkoutDays";
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
          <p>{plan.title || "برنامه تمرینی شما"}</p>
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
      <WorkoutDays plan={plan} />
      <div className={`sheet-bottom${plan.cardio ? " has-cardio" : ""}`}>
        <section className="sheet-schedule">
          <h3>تقویم هفتگی</h3>
          <div>
            {weekdays.map((day, i) => (
              <span
                key={day}
                className={plan.schedule[i] !== "استراحت" ? "training" : ""}
              >
                <b>{day}</b>
                <small>{plan.schedule[i]}</small>
              </span>
            ))}
          </div>
        </section>
        {plan.cardio && (
          <section className="sheet-cardio">
            <h3>تمرین هوازی</h3>
            <p>{plan.cardio}</p>
          </section>
        )}
      </div>
      {plan.notes && (
        <div className="sheet-notes">
          <b>یادداشت مربی</b>
          <p>{plan.notes}</p>
        </div>
      )}
      <footer>
        <b>باشگاه اکسیر · EXIR GYM</b>
        <span>مربی: {coach || "نام مربی"}</span>
      </footer>
    </article>
  );
}
