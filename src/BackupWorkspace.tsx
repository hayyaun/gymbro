import { useRef, useState } from "react";
import { Download, FileJson, ShieldCheck, Upload } from "lucide-react";
import { useStore } from "./model";
import { downloadBackup, MAX_BACKUP_BYTES, parseBackup } from "./backup";
import type { Backup, RestoreMode } from "./backup";
import { faDate, faNumber as fa } from "./library";
import Dialog from "./Dialog";

export default function BackupWorkspace() {
  const store = useStore();
  const input = useRef<HTMLInputElement>(null);
  const [backup, setBackup] = useState<Backup | null>(null);
  const [filename, setFilename] = useState("");
  const [mode, setMode] = useState<RestoreMode>("merge");
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const payments = store.students.reduce((count, student) => count + student.payments.length, 0);
  const exportFile = () => { try { downloadBackup(store); setMessage("فایل پشتیبان آماده شد. آن را در محل دلخواه ذخیره کنید."); setError(""); } catch { setError("ساخت فایل پشتیبان انجام نشد."); } };
  return <div className="workspace-page"><div className="workspace-heading"><div><span className="workspace-kicker">داده های شما، در اختیار شما</span><h1>پشتیبان گیری و بازیابی</h1><p>اطلاعات را به دستگاه دیگری ببرید یا یک نسخه برای خودتان نگه دارید.</p></div></div>
    {error && <p className="workspace-error" role="alert">{error}</p>}{message && <p className="workspace-success" role="status">{message}</p>}
    <div className="profile-grid"><section className="workspace-panel"><h2><Download size={18} />دریافت نسخه پشتیبان</h2><p className="workspace-muted">تمام برنامه ها، پرونده شاگردها، یادداشت ها، سوابق شهریه، بلوک های تمرینی و تنظیمات فضای کار در یک فایل JSON ذخیره می شوند.</p><div className="backup-counts"><span>{fa(store.plans.length)} برنامه</span><span>{fa(store.students.length)} شاگرد</span><span>{fa(payments)} پرداخت</span><span>{fa(store.blocks.length)} بلوک</span></div><button className="primary" onClick={exportFile}><Download size={17} />دریافت فایل پشتیبان</button><p className="workspace-muted backup-note">فایل شامل اطلاعات شخصی شاگردها و مبالغ پرداخت است. آن را در جای امن نگه دارید.</p></section>
      <section className="workspace-panel"><h2><Upload size={18} />بازیابی از فایل</h2><p className="workspace-muted">فایل پشتیبان جیم برو را انتخاب کنید. قبل از بازیابی، محتوا بررسی و خلاصه آن نمایش داده می شود. حداکثر حجم فایل ۱۰ مگابایت است.</p><input ref={input} className="backup-file" aria-label="فایل پشتیبان" type="file" disabled={loading} onChange={async (event) => {
        const file = event.target.files?.[0]; event.target.value = ""; if (!file) return;
        setLoading(true); setBackup(null); setError(""); setMessage("");
        try { if (file.size > MAX_BACKUP_BYTES) throw new Error("حجم فایل بیشتر از ۱۰ مگابایت است."); const parsed = parseBackup(await file.text()); setBackup(parsed); setFilename(file.name); setMode("merge"); }
        catch (cause) { setError(cause instanceof Error ? cause.message : "فایل خوانده نشد."); }
        finally { setLoading(false); }
      }} /><button className="secondary" disabled={loading} onClick={() => input.current?.click()}><FileJson size={17} />{loading ? "در حال بررسی فایل..." : "انتخاب فایل پشتیبان"}</button>
      </section></div>
    {backup && <section className="workspace-panel backup-preview"><h2><ShieldCheck size={18} />پیش نمایش فایل انتخاب شده</h2><p className="workspace-muted backup-filename">{filename} · {faDate(backup.createdAt)}</p><div className="backup-counts"><span>{fa(backup.data.plans.length)} برنامه</span><span>{fa(backup.data.students.length)} شاگرد</span><span>{fa(backup.data.students.reduce((total, student) => total + student.payments.length, 0))} پرداخت</span><span>{fa(backup.data.blocks.length)} بلوک</span></div>
      <fieldset className="backup-modes"><legend>روش بازیابی</legend><label><input type="radio" name="restore-mode" value="merge" checked={mode === "merge"} onChange={() => setMode("merge")} /><span><b>ادغام بدون حذف</b><small>رکوردهای جدید و پرداخت های جدید اضافه می شوند. برای شناسه های تکراری، نسخه فعلی این مرورگر حفظ می شود. نام مربی و تنظیمات فعلی تغییر نمی کنند.</small></span></label><label><input type="radio" name="restore-mode" value="replace" checked={mode === "replace"} onChange={() => setMode("replace")} /><span><b>جایگزینی کامل</b><small>تمام برنامه ها، شاگردها، پرداخت ها، بلوک ها و تنظیمات فعلی با محتوای همین فایل جایگزین می شوند.</small></span></label></fieldset>
      {mode === "replace" && <p className="workspace-error">مواردی که فقط در این مرورگر هستند حذف می شوند. پیش از جایگزینی، از اطلاعات فعلی فایل پشتیبان بگیرید.</p>}
      <div className="workspace-actions"><button className={mode === "replace" ? "danger" : "primary"} onClick={() => setConfirming(true)}><Upload size={16} />بررسی نهایی و بازیابی</button><button className="secondary" onClick={() => setBackup(null)}>لغو بازیابی</button></div>
    </section>}
    {confirming && backup && <Dialog title={mode === "replace" ? "تمام اطلاعات فعلی جایگزین شود؟" : "اطلاعات فایل به این مرورگر اضافه شود؟"} onClose={() => setConfirming(false)}><p>{mode === "replace" ? `اطلاعات فعلی شامل ${fa(store.plans.length)} برنامه، ${fa(store.students.length)} شاگرد، ${fa(payments)} پرداخت و ${fa(store.blocks.length)} بلوک با نسخه فایل جایگزین می شود. موارد خارج از فایل حذف خواهند شد.` : "فقط رکوردها و پرداخت هایی که شناسه جدید دارند اضافه می شوند. نسخه فعلی رکوردهای تکراری حفظ می شود."}</p><div className="modal-actions"><button className={mode === "replace" ? "danger" : "primary"} disabled={loading} onClick={async () => {
      setLoading(true); setError("");
      try { store.restoreLibrary(backup.data, mode); setBackup(null); setConfirming(false); setMessage("بازیابی کامل شد. اطلاعات در این مرورگر ذخیره شدند."); }
      catch { await useStore.persist.rehydrate(); setConfirming(false); setError("بازیابی ذخیره نشد. فضای مرورگر را بررسی کنید و فایل پشتیبان را نگه دارید."); }
      finally { setLoading(false); }
    }}>{mode === "replace" ? "جایگزینی کامل و بازیابی" : "ادغام اطلاعات"}</button><button className="secondary" disabled={loading} onClick={() => setConfirming(false)}>انصراف</button></div></Dialog>}
  </div>;
}
