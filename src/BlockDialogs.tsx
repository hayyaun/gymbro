import { useState } from "react";
import Dialog from "./Dialog";
import { faNumber as fa } from "./library";
import type { WorkoutBlock } from "./library";
import type { Day } from "./model";

export function SaveBlockDialog({ day, onSave, onClose }: { day: Day; onSave: (name: string) => void; onClose: () => void }) {
  const [name, setName] = useState(day.focus || day.name);
  return <Dialog title="ذخیره بلوک تمرینی" onClose={onClose}><p>این {fa(day.exercises.length)} حرکت با ست ها، تکرارها و توضیحاتشان در کتابخانه ذخیره می شوند.</p><form onSubmit={(event) => { event.preventDefault(); if (name.trim()) onSave(name.trim()); }}><label>نام بلوک<input autoFocus required maxLength={100} value={name} onChange={(event) => setName(event.target.value)} placeholder="مثلا گرم کردن بالاتنه" /></label><div className="modal-actions"><button className="primary" type="submit">ذخیره بلوک</button><button className="secondary" type="button" onClick={onClose}>انصراف</button></div></form></Dialog>;
}
export function InsertBlockDialog({ day, blocks, onInsert, onClose }: { day: Day; blocks: WorkoutBlock[]; onInsert: (block: WorkoutBlock, replace: boolean) => void; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [replace, setReplace] = useState(false);
  const block = blocks.find((item) => item.id === selected);
  return <Dialog title={`افزودن بلوک به ${day.name}`} onClose={onClose}><input aria-label="جستجوی بلوک" placeholder="جستجوی بلوک..." value={query} onChange={(event) => setQuery(event.target.value)} /><div className="block-picker-list">{blocks.filter((item) => item.name.includes(query)).map((item) => <button key={item.id} aria-pressed={selected === item.id} onClick={() => setSelected(item.id)}><b>{item.name}</b><small>{fa(item.exercises.length)} حرکت · {item.focus || "بلوک تمرینی"}</small></button>)}{blocks.length === 0 && <p className="workspace-empty">اول یک جلسه را به عنوان بلوک ذخیره کنید یا از کتابخانه، بلوک جدید بسازید.</p>}</div>
    <div className="block-insert-mode"><label><input type="radio" name="insert-mode" checked={!replace} onChange={() => setReplace(false)} />افزودن به انتهای جلسه</label><label><input type="radio" name="insert-mode" checked={replace} onChange={() => setReplace(true)} />جایگزینی حرکت های جلسه</label></div>
    {replace && <p className="workspace-error">تمام {fa(day.exercises.filter((item) => item.name.trim()).length)} حرکت فعلی این جلسه جایگزین می شوند. این تغییر تا ذخیره برنامه قابل لغو است.</p>}
    <div className="modal-actions"><button className={replace ? "danger" : "primary"} disabled={!block} onClick={() => block && onInsert(block, replace)}>{replace ? "جایگزینی با بلوک انتخاب شده" : "افزودن بلوک انتخاب شده"}</button><button className="secondary" onClick={onClose}>انصراف</button></div>
  </Dialog>;
}
