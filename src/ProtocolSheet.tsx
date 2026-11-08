import { ArrowUpLeft, Crosshair, Dumbbell, Focus, Moon, MoveUpRight, Zap } from "lucide-react";
import type { CSSProperties } from "react";
import type { Plan } from "./model";
import PlanDates from "./PlanDates";
import { getProtocolPalette, protocolVariables } from "./protocolTheme";
import WorkoutDays from "./WorkoutDays";
import TrainingSystemLegend from "./TrainingSystemLegend";
import { showsSheetSection } from "./sheetSections";
import { renderSheetSections } from "./renderSheetSections";
import "./ProtocolSheet.css";

const fa = (value: number) => value.toLocaleString("fa-IR");

export default function ProtocolSheet({
  plan,
  coach,
  weekdays,
}: {
  plan: Plan;
  coach: string;
  weekdays: string[];
}) {
  const palette = getProtocolPalette(plan.protocolAccent);
  const showNotes = plan.notes && showsSheetSection(plan, "notes");
  const showCardio = plan.cardio && showsSheetSection(plan, "cardio");
  const exerciseCount = plan.days.reduce((sum, day) => sum + day.exercises.length, 0);
  return (
    <article
      className={`plan-sheet template-protocol protocol-${plan.protocolMode ?? "paper"} motif-${palette.pattern}`}
      style={protocolVariables(plan.protocolAccent) as CSSProperties}
      dir="rtl"
    >
      <div className="protocol-rail">
        <span><Focus size={14} /> باشگاه اکسیر / استودیو تمرین</span>
        <b>طراحی اختصاصی · اجرای هدفمند</b>
      </div>

      <header className="protocol-hero">
        <div className="protocol-heading">
          <span className="protocol-eyebrow"><i /> پرونده تمرین / برنامه شخصی</span>
          <h2>{plan.title || "قدرت، با برنامه"}</h2>
          <div className="protocol-coach"><span>طراح برنامه</span><b>{coach || "نام مربی"}</b><MoveUpRight size={25} /></div>
        </div>
        <div className="protocol-session-count">
          <div><Crosshair size={18} /><span>پروتکل تمرین</span></div>
          <strong>{String(plan.days.length).padStart(2, "0")}</strong>
          <b>جلسه در هفته</b>
          <span className="protocol-hatch" aria-hidden="true" />
        </div>
      </header>

      <section className="protocol-athlete" aria-label="مشخصات برنامه">
        <div><span>ورزشکار</span><b>{plan.athlete || "نام ورزشکار"}</b></div>
        <div><span>هدف تمرین</span><b>{plan.goal}</b></div>
        <div><span>مدت برنامه</span><b>{plan.weeks || "—"}<small> هفته</small></b></div>
      </section>
      <PlanDates plan={plan} />

      {renderSheetSections(plan, {
        signal: showsSheetSection(plan, "signal") && <div className="protocol-signal-strip">
          <div className="protocol-pattern" aria-hidden="true" />
          <div className="protocol-signal-label"><Dumbbell size={19} /><b>تمرکز. تکرار. پیشرفت.</b><span>{fa(exerciseCount)} حرکت</span></div>
        </div>,

        workouts: <>
          <div className="protocol-section-label"><h3><span>01</span> ساختار تمرین</h3><small>{fa(plan.days.length)} جلسه / {fa(exerciseCount)} حرکت</small></div>
          <WorkoutDays plan={plan} />
        </>,
        legend: <TrainingSystemLegend plan={plan} />,

        calendar: showsSheetSection(plan, "calendar") && <section className="protocol-week">
          <div className="protocol-section-label"><h3><span>02</span> چرخه هفتگی</h3><small>تعادل تمرین و بازیابی</small></div>
          <div className="protocol-timeline">
            {weekdays.map((day, index) => {
              const training = plan.schedule[index] !== "استراحت";
              return (
                <div key={day} className={training ? "training" : "rest"}>
                  <b>{day}</b>
                  <span>{training ? <Zap size={18} /> : <Moon size={17} />}</span>
                  <small>{plan.schedule[index]}</small>
                </div>
              );
            })}
          </div>
        </section>,

        notes: showNotes && <section className="protocol-notes">
          <h3><Focus size={18} /> یادداشت مربی</h3>
          <p>{plan.notes}</p>
          <span className="protocol-note-signature">با امضای {coach || "مربی"}<ArrowUpLeft size={17} /></span>
        </section>,
        cardio: showCardio && <section className="protocol-cardio">
          <h3><Crosshair size={18} /> تمرین هوازی</h3>
          <p>{plan.cardio}</p>
          <div className="protocol-barcode" aria-hidden="true" />
        </section>,
        footer: showsSheetSection(plan, "footer") && <footer>
          <div><Dumbbell size={28} /><b>اکسیر<span>استودیو تمرین</span></b></div>
          <strong>متعهد به پیشرفت<MoveUpRight size={27} /></strong>
          <span className="protocol-footer-mark" aria-hidden="true"><i /><i /><i /></span>
        </footer>,
      }, [{
        members: ["workouts", "legend"],
        wrap: (children) => <section className="protocol-training">{children}</section>,
      }, {
        members: ["notes", "cardio"],
        wrap: (children, order) => <div className={`protocol-supplements${order.length === 2 ? " has-both" : ""}`}
          style={order.length === 2 && order[0] === "cardio" ? { gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.5fr)" } : undefined}>
          {children}
        </div>,
      }])}
    </article>
  );
}
