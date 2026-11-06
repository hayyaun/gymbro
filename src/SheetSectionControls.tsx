import type { Plan } from "./model";
import { sheetSectionLabels, sheetSectionOptions, sheetTemplate, showsSheetSection } from "./sheetSections";
import type { SheetSection } from "./sheetSections";
import "./SheetSectionControls.css";

export default function SheetSectionControls({ plan, onChange }: {
  plan: Plan;
  onChange: (data: Partial<Plan>) => void;
}) {
  const template = sheetTemplate(plan.template);
  const sections: readonly SheetSection[] = sheetSectionOptions[template];

  return (
    <fieldset className="sheet-section-controls">
      <legend>بخش های قابل نمایش</legend>
      <p>این انتخاب ها در پیش نمایش و خروجی عکس اعمال می شوند و با ذخیره برنامه، برای برنامه های جدید همین قالب به خاطر سپرده می شوند.</p>
      <div>
        {sections.map((section) => (
          <label key={section}>
            <input
              type="checkbox"
              checked={showsSheetSection(plan, section)}
              onChange={(event) => {
                const visible = event.target.checked;
                const hidden = sections.filter((item) => item === section ? !visible : !showsSheetSection(plan, item));
                onChange({ hiddenSections: { ...plan.hiddenSections, [template]: hidden } });
              }}
            />
            {sheetSectionLabels[section]}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
