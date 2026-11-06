import { BedDouble, Check, Dumbbell, HeartPulse, NotebookPen, Square } from "lucide-react";
import type { Plan } from "./model";
import { showsSheetSection } from "./sheetSections";
import TrainingSystemLegend from "./TrainingSystemLegend";
import WorkoutDays from "./WorkoutDays";
import "./PosterSheet.css";

const fa = (value: number) => value.toLocaleString("fa-IR");

function OverdriveArt() {
  return (
    <svg className="overdrive-diagram" viewBox="0 0 370 238" fill="none" aria-hidden="true">
      <g stroke="currentColor" opacity=".52" strokeWidth=".7">
        <path d="M5 46h37l12-12h16M160 15h162l14 14h26M328 30h32v164h-31M6 167v23h24m-24-12h13m-13-9h8" />
        <path d="M12 119h346M70 18v195m23-195v195M181 40v164m65-155v151m65-131v118M24 36h304M24 204h304" strokeDasharray="4 5" />
        <path d="M28 206v14h75m-12-5 12 5-12 5m48-5h60m-8-5 8 5-8 5m45-5h48m-8-5 8 5-8 5m35-5h30V95m-4 7 4-7 4 7M16 19h20m-10-10v20m303 9h20m-10-10v20" />
      </g>
      {[{ x: 79, y: 117, rx: 58, ry: 91, depth: 18 }, { x: 181, y: 117, rx: 28, ry: 72, depth: 10 }, { x: 246, y: 117, rx: 34, ry: 62, depth: 12 }, { x: 312, y: 117, rx: 15, ry: 40, depth: 7 }].map(({ x, y, rx, ry, depth }) => (
        <g key={x} stroke="currentColor">
          {[1, .66, .33].map((layer) => (
            <ellipse key={layer} cx={x + depth * layer} cy={y} rx={rx} ry={ry} opacity=".62" strokeWidth=".8" />
          ))}
          {Array.from({ length: 32 }, (_, i) => {
            const angle = i * Math.PI / 16;
            const dx = Math.cos(angle) * rx;
            const dy = Math.sin(angle) * ry;
            return <path key={i} d={`M${x + dx},${y + dy} h${depth} M${x + dx},${y + dy} L${x + dx * .26},${y + dy * .26}`} opacity=".54" strokeWidth=".65" />;
          })}
          {[1, .85, .64, .42, .26, .16].map((ring) => (
            <ellipse key={ring} cx={x} cy={y} rx={rx * ring} ry={ry * ring} opacity={ring === 1 || ring === .26 ? 1 : .65} strokeWidth={ring === 1 ? 1.4 : .65} />
          ))}
        </g>
      ))}
      <g fill="currentColor" fontFamily="monospace" fontWeight="700" direction="ltr">
        <text x="106" y="131" fontSize="17">20</text><text x="108" y="145" fontSize="10">KG</text>
        <g fontSize="10">
          <text x="28" y="230">Ø450</text><text x="155" y="230">45</text><text x="247" y="230">25</text><text x="318" y="230">15</text>
          <text x="251" y="11">PLATE / 20</text><text x="319" y="208">SECTION A</text>
        </g>
      </g>
    </svg>
  );
}

function PahlavanArt() {
  return (
    <div className="pahlavan-art" aria-hidden="true">
      <svg viewBox="0 0 760 352" preserveAspectRatio="none" fill="none">
        <defs>
          <pattern id="pahlavan-mountain-hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(30)">
            <path d="M0 0v5m2 0V2" stroke="#274638" strokeWidth=".9" opacity=".5" />
          </pattern>
          <pattern id="pahlavan-mountain-grain" width="7" height="9" patternUnits="userSpaceOnUse">
            <path d="M1 2h1m3 3h1m-4 3h1" stroke="#eed6ac" strokeWidth="1.3" />
          </pattern>
        </defs>
        <path d="M17 248a177 177 0 0 1 354 0" stroke="#a4502a" strokeWidth="13" opacity=".8" />
        <path d="M9 248a185 185 0 0 1 370 0M0 240a194 194 0 0 1 388 0" stroke="#a4502a" strokeWidth="2" strokeDasharray="2 8" opacity=".62" />
        <g stroke="#a4502a" strokeWidth="2" opacity=".56">
          {Array.from({ length: 23 }, (_, i) => {
            const angle = (i + 1) * Math.PI / 24;
            const x = Math.cos(angle);
            const y = Math.sin(angle);
            const inner = i % 2 ? 200 : 211;
            const outer = i % 2 ? 218 : 224;
            return <path key={i} d={`M${194 + x * inner},${239 - y * inner} l${x * (outer - inner)},${-y * (outer - inner)}`} />;
          })}
        </g>
        <path d="M0 313l39-25 30 3 45-23 24 12 54-27 52 36 43-12 62 30 58-31 33 7 63-40 40 14 67-38 30 8 62-33 24 7 34-24v191H0Z" fill="url(#pahlavan-mountain-hatch)" />
        <path d="M0 327l60-34 33 15 67-36 50 29 30-16 43 32 47-17 51 19 33-18 53 3 37-30 32 9 53-45 33 11 66-42 27 12 45-30v164H0Z" fill="#34503d" opacity=".8" />
        <path d="M0 327l60-34 33 15 67-36 50 29 30-16 43 32 47-17 51 19 33-18 53 3 37-30 32 9 53-45 33 11 66-42 27 12 45-30v164H0Z" fill="url(#pahlavan-mountain-grain)" opacity=".74" />
        <path d="M438 322l44-16 21-31-6 29 29-9m34-2 25-30 5-25 8 23 25-10m-4 46 25-35 34-23 9-28 11 24 21-16m-11 55 20-34 31-17" stroke="#e4c396" strokeWidth="2" opacity=".67" />
      </svg>
      <img src={`${import.meta.env.BASE_URL}pahlavan-athlete.png`} alt="" />
    </div>
  );
}

export default function PosterSheet({ plan, coach, weekdays, variant }: {
  plan: Plan;
  coach: string;
  weekdays: string[];
  variant: "overdrive" | "pahlavan";
}) {
  const isOverdrive = variant === "overdrive";
  const showArt = showsSheetSection(plan, "heroArt");
  const showNotes = Boolean(plan.notes) && showsSheetSection(plan, "notes");
  const showCardio = Boolean(plan.cardio) && showsSheetSection(plan, "cardio");
  const edition = isOverdrive ? "OVERDRIVE" : "PAHLAVAN";
  const TrainingIcon = isOverdrive ? Check : Dumbbell;
  const RestIcon = isOverdrive ? Square : BedDouble;

  return (
    <article className={`plan-sheet poster-sheet template-${variant}`} dir="rtl">
      <header className={`poster-hero${showArt ? "" : " poster-hero-without-art"}`}>
        {isOverdrive
          ? showArt && <div className="overdrive-art"><OverdriveArt /></div>
          : showArt && <PahlavanArt />}
        <div className="poster-hero-copy">
          <div className="poster-brand" dir="ltr"><strong>GYMBRO</strong><span aria-hidden="true" /></div>
          <div className="poster-edition" dir="ltr"><span>{isOverdrive ? "02" : "04"}</span>{edition}</div>
          <h2>{plan.title || "برنامه تمرینی"}</h2>
          <div className="poster-athlete"><span>ورزشکار</span><b>{plan.athlete || "نام ورزشکار"}</b></div>
          <div className="poster-facts"><span>{plan.goal}</span><span>{plan.weeks} هفته</span><span>{fa(plan.days.length)} جلسه در هفته</span></div>
        </div>
      </header>

      <WorkoutDays plan={plan} />

      <div className="poster-reference">
        <TrainingSystemLegend plan={plan} />
        {showsSheetSection(plan, "calendar") && (
          <section className="poster-calendar">
            <h3>تقویم هفتگی</h3>
            <ul>
              {weekdays.map((day, index) => {
                const session = plan.schedule[index] || "استراحت";
                const training = session !== "استراحت";
                const Icon = training ? TrainingIcon : RestIcon;
                return <li className={training ? "training" : ""} key={day}>
                  <b>{day}</b><span className="poster-calendar-mark"><Icon size={17} aria-hidden="true" /></span><small>{session}</small>
                </li>;
              })}
            </ul>
          </section>
        )}
      </div>

      {(showNotes || showCardio) && (
        <div className="poster-supplements">
          {showNotes && <section><h3><NotebookPen size={16} />یادداشت مربی</h3><p>{plan.notes}</p></section>}
          {showCardio && <section><h3><HeartPulse size={16} />تمرین هوازی</h3><p>{plan.cardio}</p></section>}
        </div>
      )}
      <footer><b>باشگاه اکسیر</b><span>مربی: {coach || "نام مربی"}</span><strong dir="ltr">{edition} / GYMBRO</strong></footer>
    </article>
  );
}
