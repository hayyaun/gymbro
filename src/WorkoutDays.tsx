import { Fragment } from "react";
import type { Plan } from "./model";
import { TrainingSystemMark } from "./TrainingSystemLegend";

export default function WorkoutDays({ plan }: { plan: Plan }) {
  return (
    <div className="sheet-days">
      {plan.days.map((day, i) => (
        <section className="sheet-day" key={day.id}>
          <h3>
            <b data-day-number={String(i + 1).padStart(2, "0")}>{day.name || `روز ${i + 1}`}</b>
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
                      {ex.trainingSystem && <TrainingSystemMark system={ex.trainingSystem} />}
                      {ex.note && <small>{ex.note}</small>}
                    </td>
                    <td dir="ltr">{ex.sets} × {ex.reps}</td>
                    <td>{ex.rest} ثانیه</td>
                  </tr>
                </Fragment>
              ))}
            </tbody>
          </table>
        </section>
      ))}
    </div>
  );
}
