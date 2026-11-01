import { Fragment } from "react";
import type { Plan } from "./model";
import ExirBrand from "./ExirBrand";
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
  return (
    <article
      className={`plan-sheet template-${plan.template}`}
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
      <div className="sheet-days">
        {plan.days.map((day, i) => (
          <section className="sheet-day" key={day.id}>
            <h3>
              <b>{day.name || `روز ${i + 1}`}</b>
              <span>{day.focus || "جلسه تمرینی"}</span>
            </h3>
            <table>
              <thead>
                <tr>
                  <th>حرکت</th>
                  <th>ست × تکرار</th>
                  <th>استراحت</th>
                </tr>
              </thead>
              <tbody>
                {day.exercises.map((ex, j) => (
                  <Fragment key={ex.id}>
                    {ex.group && day.exercises[j - 1]?.group !== ex.group && (
                      <tr className="superset-label">
                        <td colSpan={3}>سوپرست {ex.group}</td>
                      </tr>
                    )}
                    <tr className={ex.group ? "superset" : ""}>
                      <td>
                        <span className="ex-number">{j + 1}</span>
                        {ex.name || "نام حرکت"}
                        {ex.note && <small>{ex.note}</small>}
                      </td>
                      <td dir="ltr">
                        {ex.sets} × {ex.reps}
                      </td>
                      <td>{ex.rest} ثانیه</td>
                    </tr>
                  </Fragment>
                ))}
              </tbody>
            </table>
          </section>
        ))}
      </div>
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
