import { BedDouble, Check, Dumbbell, HeartPulse, NotebookPen, Square } from "lucide-react";
import type { Plan } from "./model";
import { showsSheetSection } from "./sheetSections";
import TrainingSystemLegend from "./TrainingSystemLegend";
import WorkoutDays from "./WorkoutDays";
import "./PosterSheet.css";

const fa = (value: number) => value.toLocaleString("fa-IR");

function OverdriveTitleTrace({ lower = false }: { lower?: boolean }) {
  return (
    <svg className="overdrive-title-trace" viewBox="0 0 320 23" preserveAspectRatio="none" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.4">
        {lower ? (
          <>
            <path d="M4 18h97l13-12h171m-111 7h83m-95 4h58" />
            <path d="M7 18h85m94-12h83" strokeWidth="5" strokeDasharray="4 4" />
          </>
        ) : (
          <>
            <path d="M3 5h266l16 15h16M151 9h80" />
            <path d="M4 5h139" strokeWidth="5" strokeDasharray="4 4" />
          </>
        )}
      </g>
      <path d={lower ? "M288 4h5v4h-5z" : "M301 17h5v5h-5z"} fill="currentColor" />
    </svg>
  );
}

function OverdriveArt() {
  const plates = [
    { x: 75, rx: 61, ry: 119, depth: 25 },
    { x: 184, rx: 24, ry: 61, depth: 10 },
    { x: 246, rx: 36, ry: 83, depth: 16 },
    { x: 326, rx: 14, ry: 41, depth: 8 },
  ];

  return (
    <svg className="overdrive-diagram" viewBox="0 0 417 328" fill="none" aria-hidden="true">
      <g stroke="currentColor" strokeWidth="1.1">
        <path d="M4 161h363M170 232v65m63-56v56m63-61v61m44-91v91" strokeDasharray="4 4" opacity=".7" />
        <path d="M170 290h63m-56-4-7 4 7 4m49-8 7 4-7 4M234 290h62m-55-4-7 4 7 4m48-8 7 4-7 4m8-4h43m-36-4-7 4 7 4m29-8 7 4-7 4M169 74l24-24h208M391 51v94m0 37v107m-5-228 5-10 5 10m-10 218 5 10 5-10" />
        <path d="M385 21h19m-10-9v18m-10 276h20m-10-10v20" opacity=".52" />
      </g>
      {plates.map(({ x, rx, ry, depth }, index) => {
        const y = 161;
        const openRing = index === 1 || index === 3;
        const inner = openRing ? .72 : .25;
        const point = (angle: number, radius: number) => [x + Math.cos(angle) * rx * radius, y + Math.sin(angle) * ry * radius];
        return (
          <g key={x} stroke="currentColor">
            {[1, .76, .5, .25].map((layer) => (
              <ellipse key={layer} cx={x + depth * layer} cy={y} rx={rx} ry={ry} opacity=".73" strokeWidth=".8" />
            ))}
            {Array.from({ length: 36 }, (_, i) => {
              const angle = i * Math.PI / 18;
              const [outerX, outerY] = point(angle, 1);
              const [innerX, innerY] = point(angle, inner);
              return <path key={i} d={`M${outerX},${outerY} h${depth} M${outerX},${outerY} L${innerX},${innerY}`} opacity=".63" strokeWidth=".65" />;
            })}
            {(openRing ? [1, .92, .82, inner] : [1, .93, .85, .71, .55, .38, inner]).map((ring) => (
              <ellipse key={ring} cx={x} cy={y} rx={rx * ring} ry={ry * ring} strokeWidth={ring === 1 || ring === inner ? 1.6 : .7} />
            ))}
            {index === 0 && [0, 1, 2].map((spoke) => {
              const start = spoke * 2 * Math.PI / 3 + .16;
              const stop = start + .96;
              const a = point(start, .82);
              const b = point(stop, .82);
              const c = point(stop - .1, .47);
              const d = point(start + .1, .47);
              return <path key={spoke} d={`M${a} A${rx * .82},${ry * .82} 0 0 1 ${b} L${c} A${rx * .47},${ry * .47} 0 0 0 ${d} Z`} fill="#0b2142" strokeWidth="2" />;
            })}
          </g>
        );
      })}
      <g fill="currentColor" fontFamily="monospace" fontWeight="700" direction="ltr">
        <text x="104" y="151" fontSize="21">20</text><text x="104" y="170" fontSize="13">KG</text>
        <g fontSize="13">
          <text x="391" y="168" textAnchor="middle">Ø450</text><text x="194" y="310">45</text><text x="257" y="310">25</text><text x="313" y="310">15</text>
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
        <g stroke="#a4502a" strokeWidth="2" strokeDasharray="2 4" opacity=".7">
          {Array.from({ length: 37 }, (_, i) => {
            const angle = (i + 1) * Math.PI / 38;
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
        <g fill="#e4c396" opacity=".64">
          <path d="M435 329l44-28 22-30-8 28 21-11-10 16-27 10-15 14-14 3 9-12Z" />
          <path d="M545 319l40-54 5-25 8 22 23-11-14 14-15 5-9 25-14 8-12 13Zm61 17 37-38 35-25 10-28 11 21 21-13-7 15-30 20-14 19-15 4-22 23Z" />
          <path d="M695 331l20-33 34-21 9-24 2 10v10l-24 22-8 14-11 2-13 19Z" />
        </g>
        <path d="M439 329l37-23 19-26m-29 51 25-17 10-17m41 31 25-28 10-23m-17 58 18-16 16-34m27 41 38-38 14-11m-30 59 29-29 20-21m14 45 13-19 32-25m-290 43 15-9m19-5 18-13m87 21 13-9" stroke="#e8cda4" strokeWidth="1.2" opacity=".6" />
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
  const firstDay = plan.days[0];
  const firstHeadingInHero = !isOverdrive && showArt && !!firstDay && plan.days.length <= 3 && !firstDay.focus;

  return (
    <article className={`plan-sheet poster-sheet template-${variant}`} dir="rtl">
      <header className={`poster-hero${showArt ? "" : " poster-hero-without-art"}${firstHeadingInHero ? " poster-hero-with-session" : ""}`}>
        {isOverdrive
          ? showArt && <div className="overdrive-art"><OverdriveArt /></div>
          : showArt && <PahlavanArt />}
        <div className="poster-hero-copy">
          <div className="poster-brand" dir="ltr"><strong>GYMBRO</strong><span aria-hidden="true" /></div>
          {isOverdrive && showArt && <OverdriveTitleTrace />}
          <div className="poster-edition" dir="ltr"><span>{isOverdrive ? "02" : "04"}</span>{edition}</div>
          {isOverdrive && showArt && <OverdriveTitleTrace lower />}
          <h2>{plan.title || "برنامه تمرینی"}</h2>
          <div className="poster-athlete"><span>ورزشکار</span><b>{plan.athlete || "نام ورزشکار"}</b></div>
          <div className="poster-facts"><span>{plan.goal}</span><span>{plan.weeks} هفته</span><span>{fa(plan.days.length)} جلسه در هفته</span></div>
        </div>
        {firstHeadingInHero && <h3 className="pahlavan-first-day"><b>{firstDay.name || "روز ۱"}</b></h3>}
      </header>

      <WorkoutDays plan={plan} firstHeadingInHero={firstHeadingInHero} />

      <div className="poster-reference">
        <TrainingSystemLegend plan={plan} />
        {showsSheetSection(plan, "calendar") && (
          <section className="poster-calendar">
            <h3><span>تقویم هفتگی</span></h3>
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
          {showNotes && <section><h3><span><NotebookPen size={16} />یادداشت مربی</span></h3><p>{plan.notes}</p></section>}
          {showCardio && <section><h3><span><HeartPulse size={16} />تمرین هوازی</span></h3><p>{plan.cardio}</p></section>}
        </div>
      )}
      <footer><b>باشگاه اکسیر</b><span>مربی: {coach || "نام مربی"}</span><strong dir="ltr">{edition} / GYMBRO</strong></footer>
    </article>
  );
}
