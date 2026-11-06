import { useId, useRef, useState } from "react";
import { X } from "lucide-react";
import type { Exercise } from "./model";
import { exerciseSearchKey } from "./exerciseCatalog";
import { trainingSystemIds, trainingSystems } from "./trainingSystems";
import "./ExerciseTools.css";

export default function ExerciseEditor({ value, index, session, catalog, onChange, onRemove, onAddAfter, autoFocus = false }: {
  value: Exercise; index: number; session: number | string; catalog: string[];
  onChange: (value: Exercise) => void; onRemove: () => void; onAddAfter: () => void; autoFocus?: boolean;
}) {
  const listId = useId();
  const systemHintId = useId();
  const system = value.trainingSystem && trainingSystems[value.trainingSystem];
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(0);
  const sets = useRef<HTMLInputElement>(null);
  const reps = useRef<HTMLInputElement>(null);
  const rest = useRef<HTMLInputElement>(null);
  const group = useRef<HTMLInputElement>(null);
  const note = useRef<HTMLInputElement>(null);
  const composing = useRef(false);
  const matches = catalog.filter((name) => exerciseSearchKey(name).includes(exerciseSearchKey(value.name))).slice(0, 8);
  const selectedIndex = Math.min(selected, matches.length - 1);
  const choose = (name: string) => { onChange({ ...value, name }); setOpen(false); sets.current?.focus(); sets.current?.select(); };
  return <div className="exercise-editor">
    <div className="exercise-top"><span>{(index + 1).toLocaleString("fa-IR")}</span>
      <div className="exercise-name-picker">
        <input role="combobox" autoFocus={autoFocus} autoComplete="off" maxLength={200}
          aria-label={`نام حرکت ${index + 1} جلسه ${session}`} aria-autocomplete="list" aria-expanded={open && matches.length > 0} aria-controls={listId}
          aria-activedescendant={open && selectedIndex >= 0 ? `${listId}-${selectedIndex}` : undefined}
          placeholder="حرکت را جستجو کنید یا بنویسید" value={value.name}
          onCompositionStart={() => { composing.current = true; }} onCompositionEnd={() => { composing.current = false; }}
          onFocus={() => { setOpen(true); setSelected(0); }} onBlur={() => setOpen(false)}
          onChange={(event) => { onChange({ ...value, name: event.target.value }); setOpen(true); setSelected(0); }}
          onKeyDown={(event) => {
            if (event.nativeEvent.isComposing || composing.current) return;
            if (event.key === "ArrowDown" || event.key === "ArrowUp") { event.preventDefault(); setOpen(true); setSelected((current) => Math.max(0, Math.min(matches.length - 1, current + (event.key === "ArrowDown" ? 1 : -1)))); }
            if (event.key === "Escape") { event.preventDefault(); setOpen(false); }
            if (event.key === "Enter") { event.preventDefault(); choose(open && selectedIndex >= 0 ? matches[selectedIndex] : value.name); }
          }} />
        {open && matches.length > 0 && <div className="exercise-suggestions" id={listId} role="listbox" aria-label="پیشنهاد حرکت">{matches.map((name, position) => <button type="button" role="option" aria-selected={position === selectedIndex} id={`${listId}-${position}`} key={name} onPointerDown={(event) => event.preventDefault()} onClick={() => choose(name)}>{name}<small>↵</small></button>)}<p>↑ ↓ انتخاب · Enter تایید · نام دلخواه هم قابل ثبت است</p></div>}
      </div>
      <button type="button" className="icon-button" aria-label={`حذف حرکت ${index + 1} جلسه ${session}`} onClick={onRemove}><X size={15} /></button>
    </div>
    <div className="exercise-fields">{([
      { key: "sets", label: "ست", ref: sets, next: reps }, { key: "reps", label: "تکرار", ref: reps, next: rest },
      { key: "rest", label: "استراحت (ثانیه)", ref: rest, next: null }, { key: "group", label: "سوپرست", ref: group, next: note },
    ] as const).map(({ key, label, ref, next }) => <label key={key}>{label}<input ref={ref} aria-label={`${label} حرکت ${index + 1} جلسه ${session}`} maxLength={60} value={value[key]} placeholder={key === "group" ? "A / B" : ""} onChange={(event) => onChange({ ...value, [key]: event.target.value })} onKeyDown={(event) => {
      if (event.key !== "Enter" || event.nativeEvent.isComposing) return;
      event.preventDefault();
      if (next) { next.current?.focus(); next.current?.select(); }
      else onAddAfter();
    }} /></label>)}</div>
    <div className="exercise-system-field">
      <label>
        سیستم تمرینی
        <select value={value.trainingSystem ?? ""} aria-describedby={system ? systemHintId : undefined}
          onChange={(event) => {
            const trainingSystem = trainingSystemIds.find((id) => id === event.target.value);
            const next = { ...value };
            if (trainingSystem) next.trainingSystem = trainingSystem;
            else delete next.trainingSystem;
            onChange(next);
          }}>
          <option value="">عادی</option>
          {trainingSystemIds.map((id) => <option key={id} value={id}>{trainingSystems[id].name}</option>)}
        </select>
      </label>
      {system && <small id={systemHintId}>{system.hint}</small>}
    </div>
    <input ref={note} className="note-input" aria-label={`توضیح حرکت ${index + 1} جلسه ${session}`} maxLength={2000} value={value.note} placeholder="توضیح حرکت (اختیاری)" onChange={(event) => onChange({ ...value, note: event.target.value })} onKeyDown={(event) => { if (event.key === "Enter" && !event.nativeEvent.isComposing) { event.preventDefault(); onAddAfter(); } }} />
  </div>;
}
