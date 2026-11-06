import type { Plan } from "./model";
import { GripVertical } from "lucide-react";
import { useSortable } from "@dnd-kit/react/sortable";
import { orderedSheetSections, sheetSectionLabels, sheetSectionOptions, sheetTemplate, showsSheetSection } from "./sheetSections";
import type { SheetLayoutSection, SheetSection } from "./sheetSections";
import { SortableList } from "./SortableSessions";
import "./SheetSectionControls.css";

function SectionRow({ section, index, visible, onToggle }: {
  section: SheetLayoutSection;
  index: number;
  visible: boolean;
  onToggle: (section: SheetSection, visible: boolean) => void;
}) {
  const { ref, handleRef, isDragging } = useSortable({ id: section, index });
  const name = section === "workouts" ? "جدول های تمرین" : sheetSectionLabels[section];
  return (
    <div ref={ref} className={`sheet-section-row${isDragging ? " dragging" : ""}`}>
      {section === "workouts" ? (
        <span className="sheet-section-required">{name} <small>همیشه نمایش داده می شود</small></span>
      ) : (
        <label>
          <input type="checkbox" checked={visible} onChange={(event) => onToggle(section, event.target.checked)} />
          {name}
        </label>
      )}
      <button ref={handleRef} type="button" className="session-drag-handle" aria-label={`جابجایی ${name}`}>
        <GripVertical size={18} />
      </button>
    </div>
  );
}

export default function SheetSectionControls({ plan, onChange }: {
  plan: Plan;
  onChange: (data: Partial<Plan>) => void;
}) {
  const template = sheetTemplate(plan.template);
  const sections: readonly SheetSection[] = sheetSectionOptions[template];
  const order = orderedSheetSections(plan);

  return (
    <fieldset className="sheet-section-controls">
      <legend>بخش های قابل نمایش</legend>
      <p>این انتخاب ها در پیش نمایش و خروجی عکس اعمال می شوند و با ذخیره برنامه، برای برنامه های جدید همین قالب به خاطر سپرده می شوند.</p>
      <p>برای تغییر ترتیب، دستگیره کنار بخش را بکشید یا از کلید ورود و جهت ها استفاده کنید.{sections.includes("heroArt") && " دستگیره تصویر، سربرگ پوستر را جابجا می کند."}</p>
      <SortableList onMove={(from, to) => {
        const next = [...order];
        const [moved] = next.splice(from, 1);
        next.splice(to, 0, moved);
        onChange({ sectionOrder: { ...plan.sectionOrder, [template]: next } });
      }}>
        {order.map((section, index) => (
          <SectionRow key={section} section={section} index={index}
            visible={section === "workouts" || showsSheetSection(plan, section)}
            onToggle={(changed, visible) => {
              const hidden = sections.filter((item) => item === changed ? !visible : !showsSheetSection(plan, item));
              onChange({ hiddenSections: { ...plan.hiddenSections, [template]: hidden } });
            }}
          />
        ))}
      </SortableList>
    </fieldset>
  );
}
