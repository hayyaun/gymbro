import type { Plan } from "./model";
import { faDate, isDate } from "./library";
import "./PlanDates.css";

export default function PlanDates({ plan }: { plan: Plan }) {
  const dates = [
    { label: "شروع برنامه", value: plan.startDate },
    { label: "پایان برنامه", value: plan.endDate },
  ].filter(({ value }) => value && isDate(value));
  if (!dates.length) return null;
  return (
    <div className="plan-dates" aria-label="بازه زمانی برنامه">
      {dates.map(({ label, value }) => (
        <span key={label}>{label}<time dateTime={value}>{faDate(value!)}</time></span>
      ))}
    </div>
  );
}
