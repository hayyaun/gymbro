import { useEffect, useImperativeHandle, useState } from "react";
import type { Ref } from "react";
import { ArrowRight, Check, Layers, Plus, Search, Trash2 } from "lucide-react";
import { exercise, uid, useStore } from "./model";
import type { Exercise } from "./model";
import type { WorkoutBlock } from "./library";
import { faNumber as fa } from "./library";
import type { WorkspaceHandle } from "./StudentsWorkspace";
import ExerciseEditor from "./ExerciseEditor";
import { exerciseCatalog } from "./exerciseCatalog";
import Dialog from "./Dialog";

export default function BlocksWorkspace({ editorRef, onDirtyChange, navigate }: { editorRef: Ref<WorkspaceHandle>; onDirtyChange: (dirty: boolean) => void; navigate: (action: () => void) => void }) {
  const { blocks, plans, saveBlock, removeBlock } = useStore();
  const [editing, setEditing] = useState<WorkoutBlock | null>(null);
  const [baseline, setBaseline] = useState("");
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [focusId, setFocusId] = useState("");
  const [deleting, setDeleting] = useState<WorkoutBlock | null>(null);
  const dirty = !!editing && JSON.stringify(editing) !== baseline;
  useEffect(() => { onDirtyChange(dirty); return () => onDirtyChange(false); }, [dirty, onDirtyChange]);
  const save = () => {
    if (!editing || !editing.name.trim() || !editing.exercises.length || editing.exercises.some((item) => !item.name.trim() || !item.sets.trim() || !item.reps.trim() || !item.rest.trim())) { setError("نام بلوک و مشخصات تمام حرکت ها را کامل کنید."); return false; }
    try {
      const block = { ...editing, name: editing.name.trim(), updatedAt: new Date().toISOString() };
      saveBlock(block); setEditing(block); setBaseline(JSON.stringify(block)); setError(""); setMessage("بلوک تمرینی ذخیره شد"); onDirtyChange(false); return true;
    } catch { setError("ذخیره بلوک انجام نشد. فضای مرورگر را بررسی کنید."); return false; }
  };
  useImperativeHandle(editorRef, () => ({ save }));
  const open = (block: WorkoutBlock, fresh = false) => navigate(() => { setEditing(structuredClone(block)); setBaseline(fresh ? "" : JSON.stringify(block)); setMessage(""); setError(""); });
  const patchExercise = (value: Exercise) => editing && setEditing({ ...editing, exercises: editing.exercises.map((item) => item.id === value.id ? value : item) });
  const addAfter = (index: number) => {
    if (!editing) return;
    const next = exercise(); const exercises = [...editing.exercises]; exercises.splice(index + 1, 0, next);
    setEditing({ ...editing, exercises }); setFocusId(next.id);
  };
  return <div className="workspace-page"><div className="workspace-heading"><div><span className="workspace-kicker">کتابخانه شخصی مربی</span><h1>{editing ? "ویرایش بلوک تمرینی" : "بلوک های تمرینی"}</h1><p>حرکت های پرکاربرد را یک بار بنویسید و در برنامه های بعدی استفاده کنید.</p></div>
    {editing ? <div className="workspace-actions"><button className="secondary" onClick={() => navigate(() => setEditing(null))}><ArrowRight size={16} />کتابخانه بلوک ها</button><button className="primary" onClick={save}><Check size={17} />ذخیره بلوک</button></div> : <button className="primary" onClick={() => open({ id: uid(), name: "", focus: "", exercises: [exercise()], updatedAt: new Date().toISOString() }, true)}><Plus size={17} />بلوک جدید</button>}</div>
    {error && <p role="alert" className="workspace-error">{error}</p>}{message && <p role="status" className="workspace-success">{message}</p>}
    {!editing ? <><label className="search workspace-search"><Search size={17} /><input aria-label="جستجوی بلوک تمرینی" value={query} placeholder="جستجوی بلوک..." onChange={(event) => setQuery(event.target.value)} /></label><div className="student-cards">{blocks.filter((item) => item.name.includes(query)).map((block) => <article className="workspace-panel" key={block.id}><h2><Layers size={18} />{block.name}</h2><p className="workspace-muted">{block.focus || "بلوک تمرینی"} · {fa(block.exercises.length)} حرکت</p><div className="workspace-actions"><button className="secondary" onClick={() => open(block)}>ویرایش بلوک</button><button className="icon-button" aria-label={`حذف بلوک ${block.name}`} onClick={() => setDeleting(block)}><Trash2 size={16} /></button></div></article>)}</div>{blocks.length === 0 && <p className="workspace-empty"><Layers />هنوز بلوکی ندارید. یک بلوک بسازید یا از داخل جلسه، حرکت های آن را ذخیره کنید.</p>}</> : <section className="workspace-panel block-editor"><p className="workspace-save-state">{dirty ? "تغییرات بلوک ذخیره نشده" : "بلوک ذخیره شده"}</p><label>نام بلوک<input required maxLength={100} value={editing.name} onChange={(event) => setEditing({ ...editing, name: event.target.value })} /></label><label>تمرکز بلوک<input maxLength={200} value={editing.focus} onChange={(event) => setEditing({ ...editing, focus: event.target.value })} /></label><p className="keyboard-tip">Enter: نام حرکت ← ست ← تکرار ← استراحت ← حرکت بعدی. برای سوپرست و توضیح از Tab استفاده کنید.</p>
      {editing.exercises.map((item, index) => <ExerciseEditor key={item.id} value={item} index={index} session="بلوک" catalog={exerciseCatalog(plans, blocks)} autoFocus={focusId === item.id} onChange={patchExercise} onRemove={() => setEditing({ ...editing, exercises: editing.exercises.filter((entry) => entry.id !== item.id) })} onAddAfter={() => addAfter(index)} />)}<button className="add-exercise" onClick={() => addAfter(editing.exercises.length - 1)}><Plus size={16} />افزودن حرکت</button>
    </section>}
    {deleting && <Dialog title="این بلوک حذف شود؟" onClose={() => setDeleting(null)}><p>بلوک «{deleting.name}» از کتابخانه حذف می شود. برنامه هایی که قبلا از آن استفاده کرده اند تغییر نمی کنند.</p><div className="modal-actions"><button className="danger" onClick={() => { try { removeBlock(deleting.id); setDeleting(null); } catch { setError("حذف بلوک ناموفق بود."); } }}>حذف بلوک</button><button className="secondary" onClick={() => setDeleting(null)}>انصراف</button></div></Dialog>}
  </div>;
}
