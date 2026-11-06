import type { Plan } from "./model";
import ForgeSheet from "./ForgeSheet";
import ProtocolSheet from "./ProtocolSheet";
import PosterSheet from "./PosterSheet";
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
  if (plan.template === "protocol") {
    return <ProtocolSheet plan={plan} coach={coach} weekdays={weekdays} />;
  }
  if (plan.template === "overdrive" || plan.template === "pahlavan") {
    return <PosterSheet plan={plan} coach={coach} weekdays={weekdays} variant={plan.template} />;
  }
  return <ForgeSheet plan={plan} coach={coach} weekdays={weekdays} />;
}
