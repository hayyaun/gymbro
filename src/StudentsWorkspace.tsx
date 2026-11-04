import { useEffect, useImperativeHandle, useState } from "react";
import type { Ref } from "react";
import { ArrowRight, Check, CreditCard, FileText, Pencil, Plus, Search, Trash2, Users } from "lucide-react";
import { uid, useStore } from "./model";
import type { Plan } from "./model";
import { faDate, faNumber as fa, isDate, makeStudent, studentKey, today } from "./library";
import type { Payment, Student } from "./library";
import Dialog from "./Dialog";
import "./Workspace.css";

export type WorkspaceHandle = { save: () => boolean };
type Props = {
  studentId: string | null;
  editorRef: Ref<WorkspaceHandle>;
  onDirtyChange: (dirty: boolean) => void;
  navigate: (action: () => void) => void;
  onProgram: (plan: Plan) => void;
  onNewProgram: (student: Student) => void;
  onViewedStudentChange: (id: string | null) => void;
};
const methods = { card: "کارت به کارت", cash: "نقدی", transfer: "واریز بانکی" };
const blankPayment = (): Payment => ({ id: uid(), amount: 0, date: today(), period: "", method: "card", note: "" });

export default function StudentsWorkspace({ studentId, editorRef, onDirtyChange, navigate, onProgram, onNewProgram, onViewedStudentChange }: Props) {
  const { students, plans, saveStudent } = useStore();
  const initial = students.find((student) => student.id === studentId) ?? null;
  const [editing, setEditing] = useState<Student | null>(() => initial ? structuredClone(initial) : null);
  const [baseline, setBaseline] = useState(() => initial ? JSON.stringify(initial) : "");
  const [query, setQuery] = useState("");
  const [payment, setPayment] = useState<Payment>(blankPayment);
  const [paymentBaseline, setPaymentBaseline] = useState("");
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [deletingPayment, setDeletingPayment] = useState<Payment | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const paymentDirty = paymentOpen && (paymentBaseline ? JSON.stringify(payment) !== paymentBaseline : !!(payment.amount || payment.period || payment.note || payment.method !== "card" || payment.date !== today()));
  const dirty = (!!editing && JSON.stringify(editing) !== baseline) || paymentDirty;
  useEffect(() => { onDirtyChange(dirty); return () => onDirtyChange(false); }, [dirty, onDirtyChange]);
  useEffect(() => { onViewedStudentChange(editing?.id ?? null); }, [editing?.id, onViewedStudentChange]);
  const closePayment = () => { setPaymentOpen(false); setPayment(blankPayment()); setPaymentBaseline(""); };
  const withPayment = () => {
    if (!editing) return null;
    if (!paymentOpen || (!paymentDirty && !paymentBaseline)) return editing;
    if (!Number.isSafeInteger(payment.amount) || payment.amount <= 0 || payment.amount > 1000000000000 || !isDate(payment.date)) {
      setError("مبلغ را به تومان و به صورت عدد صحیح مثبت وارد کنید و تاریخ را کامل کنید.");
      return null;
    }
    return { ...editing, payments: [payment, ...editing.payments.filter((item) => item.id !== payment.id)] };
  };
  const save = () => {
    const next = withPayment();
    if (!next) return false;
    if (!studentKey(next.name)) { setError("نام شاگرد را وارد کنید."); return false; }
    const student = { ...next, name: studentKey(next.name), updatedAt: new Date().toISOString() };
    try {
      saveStudent(student);
      setEditing(student); setBaseline(JSON.stringify(student)); closePayment(); setError("");
      setMessage("پرونده ذخیره شد"); onDirtyChange(false);
      return true;
    } catch { setError("ذخیره انجام نشد. فضای ذخیره مرورگر را بررسی کنید."); return false; }
  };
  useImperativeHandle(editorRef, () => ({ save }));
  const open = (student: Student, fresh = false) => navigate(() => {
    setEditing(structuredClone(student)); setBaseline(fresh ? "" : JSON.stringify(student));
    closePayment(); setError(""); setMessage(""); window.scrollTo({ top: 0 });
  });
  const patch = (value: Partial<Student>) => setEditing((current) => current ? { ...current, ...value } : current);
  const history = plans.filter((plan) => plan.studentId === editing?.id);
  return <div className="workspace-page">
    <div className="workspace-heading">
      <div><span className="workspace-kicker">پرونده های مربی</span><h1>{editing ? editing.name || "شاگرد جدید" : "شاگردها"}</h1><p>{editing ? "مشخصات، برنامه های تمرینی و سوابق شهریه" : "پرونده هر شاگرد و سوابقش را یک جا نگه دارید."}</p></div>
      {editing ? <div className="workspace-actions"><button className="secondary" onClick={() => navigate(() => { setEditing(null); closePayment(); })}><ArrowRight size={16} />همه شاگردها</button><button className="primary" onClick={save}><Check size={17} />ذخیره پرونده</button></div>
        : <button className="primary" onClick={() => open(makeStudent(), true)}><Plus size={17} />شاگرد جدید</button>}
    </div>
    {error && <p className="workspace-error" role="alert">{error}</p>}
    {message && <p className="workspace-success" role="status">{message}</p>}
    {!editing ? <>
      <label className="search workspace-search"><Search size={17} /><input aria-label="جستجوی شاگرد" placeholder="جستجوی نام شاگرد..." value={query} onChange={(event) => setQuery(event.target.value)} /></label>
      <div className="student-cards">{students.filter((student) => studentKey(student.name).includes(studentKey(query))).sort((a, b) => a.name.localeCompare(b.name, "fa")).map((student) => <button className="student-card" key={student.id} onClick={() => open(student)}>
        <span className="profile-avatar">{student.name[0]}</span><div><h2>{student.name}</h2><p>{student.goal || "هدف هنوز ثبت نشده"}</p><small>{fa(plans.filter((plan) => plan.studentId === student.id).length)} برنامه · {fa(student.payments.length)} پرداخت</small></div><ArrowRight size={17} />
      </button>)}</div>
      {students.length === 0 && <p className="workspace-empty"><Users />هنوز شاگردی ثبت نشده. اولین پرونده را بسازید.</p>}
    </> : <>
      <div className="workspace-save-state">{dirty ? "تغییرات پرونده ذخیره نشده" : "پرونده ذخیره شده"}</div>
      <div className="profile-grid">
        <section className="workspace-panel"><h2><Users size={18} />مشخصات شاگرد</h2>
          <label>نام شاگرد<input maxLength={80} value={editing.name} onChange={(event) => patch({ name: event.target.value })} /></label>
          <label>هدف تمرینی<input maxLength={200} placeholder="مثلا افزایش قدرت و آمادگی عمومی" value={editing.goal} onChange={(event) => patch({ goal: event.target.value })} /></label>
          <label>تجهیزات در دسترس<textarea maxLength={2000} placeholder="مثلا باشگاه کامل، دمبل یا کش در خانه" value={editing.equipment} onChange={(event) => patch({ equipment: event.target.value })} /></label>
          <label>یادداشت مربی برای این شاگرد<textarea maxLength={10000} value={editing.notes} onChange={(event) => patch({ notes: event.target.value })} /></label>
          <small className="workspace-muted">یادداشت پرونده و سوابق پرداخت در تصویر برنامه نمایش داده نمی شوند.</small>
        </section>
        <section className="workspace-panel"><div className="workspace-section-title"><h2><FileText size={18} />سوابق برنامه ها</h2><span>{fa(history.length)}</span></div>
          <button className="secondary full" onClick={() => {
            // Save first so a new profile has an identity before its first plan.
            if (save()) onNewProgram({ ...editing, name: studentKey(editing.name) });
          }}><Plus size={16} />برنامه جدید برای این شاگرد</button>
          {history.map((plan) => <button className="history-row" key={plan.id} onClick={() => navigate(() => onProgram(plan))}><div><b>{plan.title}</b><small>{faDate(plan.updatedAt)} · {fa(plan.days.length)} جلسه در هفته</small></div><Pencil size={15} /></button>)}
          {history.length === 0 && <p className="workspace-empty">هنوز برنامه ای برای این شاگرد ذخیره نشده.</p>}
        </section>
      </div>
      <section className="workspace-panel payment-panel"><div className="workspace-section-title"><h2><CreditCard size={18} />سوابق پرداخت شهریه</h2><button className="secondary" onClick={() => { if (!paymentOpen) { setPayment(blankPayment()); setPaymentBaseline(""); setPaymentOpen(true); } }}><Plus size={16} />ثبت پرداخت</button></div>
        <div className="payment-summary"><b>{fa(editing.payments.reduce((total, item) => total + item.amount, 0))} <small>تومان</small></b><span>مجموع {fa(editing.payments.length)} پرداخت ثبت شده</span></div>
        {paymentOpen && <form className="payment-form" onSubmit={(event) => { event.preventDefault(); const next = withPayment(); if (next) { setEditing(next); closePayment(); setError(""); setMessage("پرداخت به پرونده اضافه شد. برای ثبت نهایی، پرونده را ذخیره کنید."); } }}>
          <div className="workspace-fields"><label>مبلغ (تومان)<input type="number" min="1" max="1000000000000" step="1" required value={payment.amount || ""} onChange={(event) => setPayment({ ...payment, amount: Number(event.target.value) })} /></label>
            <label>تاریخ پرداخت<input type="date" required value={payment.date} onChange={(event) => setPayment({ ...payment, date: event.target.value })} /><small className="workspace-muted">{isDate(payment.date) ? faDate(payment.date) : "تاریخ معتبر وارد کنید"}</small></label>
            <label>بابت دوره<input maxLength={200} placeholder="مثلا شهریه آبان" value={payment.period} onChange={(event) => setPayment({ ...payment, period: event.target.value })} /></label>
            <label>روش پرداخت<select value={payment.method} onChange={(event) => setPayment({ ...payment, method: event.target.value as Payment["method"] })}>{Object.entries(methods).map(([key, name]) => <option key={key} value={key}>{name}</option>)}</select></label></div>
          <label>توضیح پرداخت<input maxLength={2000} placeholder="شماره پیگیری یا توضیح اختیاری" value={payment.note} onChange={(event) => setPayment({ ...payment, note: event.target.value })} /></label>
          <div className="workspace-actions"><button className="primary" type="submit">{paymentBaseline ? "اعمال ویرایش پرداخت" : "افزودن به پرونده"}</button><button className="secondary" type="button" onClick={closePayment}>انصراف از پرداخت</button></div>
        </form>}
        {[...editing.payments].sort((a, b) => b.date.localeCompare(a.date)).map((item) => <div className="payment-row" key={item.id}>
          <div><b>{fa(item.amount)} تومان</b><small>{faDate(item.date)} · {methods[item.method]}</small></div><div><b>{item.period || "شهریه"}</b>{item.note && <small>{item.note}</small>}</div>
          <div className="workspace-actions"><button className="icon-button" aria-label={`ویرایش پرداخت ${faDate(item.date)}`} disabled={paymentOpen} onClick={() => { setPayment(structuredClone(item)); setPaymentBaseline(JSON.stringify(item)); setPaymentOpen(true); }}><Pencil size={16} /></button><button className="icon-button" aria-label={`حذف پرداخت ${faDate(item.date)}`} disabled={paymentOpen} onClick={() => setDeletingPayment(item)}><Trash2 size={16} /></button></div>
        </div>)}
        {editing.payments.length === 0 && !paymentOpen && <p className="workspace-empty">هنوز پرداختی ثبت نشده.</p>}
      </section>
    </>}
    {deletingPayment && <Dialog title="این پرداخت از پرونده حذف شود؟" onClose={() => setDeletingPayment(null)}><p>پرداخت {fa(deletingPayment.amount)} تومان در تاریخ {faDate(deletingPayment.date)} حذف می شود. این تغییر با ذخیره پرونده ثبت خواهد شد.</p><div className="modal-actions"><button className="danger" onClick={() => { patch({ payments: editing!.payments.filter((item) => item.id !== deletingPayment.id) }); setDeletingPayment(null); }}>حذف پرداخت</button><button className="secondary" onClick={() => setDeletingPayment(null)}>انصراف</button></div></Dialog>}
  </div>;
}
