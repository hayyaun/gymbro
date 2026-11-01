import type { Plan } from "./model";
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
        <div>
          <span className="sheet-eyebrow">برنامه اختصاصی تمرین</span>
          <h2>{plan.athlete || "نام ورزشکار"}</h2>
          <p>{plan.title || "برنامه تمرینی شما"}</p>
        </div>
        <div className="sheet-brand" dir="ltr">
          GYM<span>BRO.</span>
          <small>BUILT FOR PROGRESS</small>
        </div>
      </header>
      <div className="sheet-meta">
        <span>{plan.goal}</span>
        <span>{plan.days.length} جلسه در هفته</span>
        <span>{plan.weeks} هفته</span>
        <span>مربی: {coach || "مربی"}</span>
      </div>
      <div className="sheet-days">
        {plan.days.map((day, i) => (
          <section className="sheet-day" key={day.id}>
            <h3>
              <b>{String(i + 1).padStart(2, "0")}</b>
              <span>
                {day.name}
                <small>{day.focus}</small>
              </span>
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
                  <tr key={ex.id} className={ex.group ? "superset" : ""}>
                    <td>
                      <span className="ex-number">{ex.group || j + 1}</span>
                      {ex.name || "نام حرکت"}
                      {ex.note && <small>{ex.note}</small>}
                    </td>
                    <td dir="ltr">
                      {ex.sets} × {ex.reps}
                    </td>
                    <td>{ex.rest} ثانیه</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ))}
      </div>
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
      {(plan.cardio || plan.notes) && (
        <div className="sheet-notes">
          {plan.cardio && (
            <p>
              <b>هوازی</b>
              {plan.cardio}
            </p>
          )}
          {plan.notes && (
            <p>
              <b>یادداشت مربی</b>
              {plan.notes}
            </p>
          )}
        </div>
      )}
      <footer>
        <span>طراحی شده برای پیشرفت شما</span>
        <b dir="ltr">GYMBRO / COACHING STUDIO</b>
      </footer>
    </article>
  );
}
