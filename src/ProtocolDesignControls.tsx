import { Check, Moon, Sun } from "lucide-react";
import type { Plan } from "./model";
import { protocolPalettes } from "./protocolTheme";
import type { ProtocolAccent } from "./protocolTheme";

export default function ProtocolDesignControls({
  plan,
  onChange,
}: {
  plan: Plan;
  onChange: (data: Partial<Plan>) => void;
}) {
  return (
    <>
      <h3>جنس زمینه</h3>
      <div className="appearance-modes" role="group" aria-label="جنس زمینه پروتکل">
        {([
          { id: "paper", name: "کاغذی", icon: Sun },
          { id: "dark", name: "تیره", icon: Moon },
        ] as const).map(({ id, name, icon: Icon }) => (
          <button
            key={id}
            className={(plan.protocolMode ?? "paper") === id ? "chosen" : ""}
            aria-pressed={(plan.protocolMode ?? "paper") === id}
            onClick={() => onChange({ protocolMode: id })}
          >
            <Icon size={18} />{name}<Check size={15} />
          </button>
        ))}
      </div>
      <h3>رنگ و الگوی پروتکل</h3>
      <div className="appearance-palettes" role="group" aria-label="رنگ پروتکل">
        {(Object.entries(protocolPalettes) as [ProtocolAccent, typeof protocolPalettes[ProtocolAccent]][]).map(([id, palette]) => (
          <button
            key={id}
            className={(plan.protocolAccent ?? "orange") === id ? "chosen" : ""}
            aria-pressed={(plan.protocolAccent ?? "orange") === id}
            onClick={() => onChange({ protocolAccent: id })}
          >
            <i style={{ background: palette.color, color: "#141815" }}>
              {(plan.protocolAccent ?? "orange") === id && <Check size={14} />}
            </i>
            {palette.name}
          </button>
        ))}
      </div>
      <p className="appearance-note">
        هر رنگ، الگوی گرافیکی خودش را دارد. تنظیمات ظاهر با همین برنامه ذخیره می شوند.
      </p>
    </>
  );
}
