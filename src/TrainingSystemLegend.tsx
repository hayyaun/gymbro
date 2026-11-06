import { ArrowDown, Layers, Pause } from "lucide-react";
import type { Plan } from "./model";
import { trainingSystemIds, trainingSystems } from "./trainingSystems";
import type { TrainingSystem } from "./trainingSystems";
import { showsSheetSection } from "./sheetSections";
import "./TrainingSystemLegend.css";

const icons = { "drop-set": ArrowDown, "rest-pause": Pause, "fst-7": Layers };

export function TrainingSystemMark({ system, decorative = false }: { system: TrainingSystem; decorative?: boolean }) {
  const Icon = icons[system];
  if (!Icon) return null;
  return <span className={`training-system-mark system-${system}`}
    role={decorative ? undefined : "img"} aria-hidden={decorative || undefined}
    aria-label={decorative ? undefined : trainingSystems[system].name}>
    <Icon size={12} aria-hidden="true" />
  </span>;
}

export default function TrainingSystemLegend({ plan }: { plan: Plan }) {
  if (!showsSheetSection(plan, "legend")) return null;

  const used = new Set(plan.days.flatMap((day) => day.exercises.map((exercise) => exercise.trainingSystem)));
  const systems = trainingSystemIds.filter((id) => used.has(id));
  if (!systems.length) return null;

  return <section className="training-system-legend" aria-label="راهنمای سیستم های تمرینی">
    <h3><strong>راهنمای سیستم های تمرینی</strong><span lang="en" dir="ltr">Legends</span></h3>
    <ul>{systems.map((id) => {
      const { name, example, description } = trainingSystems[id];
      return <li key={id}>
        <TrainingSystemMark system={id} decorative />
        <div><b>{name}</b> <bdi dir="ltr">{example}</bdi><p>{description}</p></div>
      </li>;
    })}</ul>
  </section>;
}
