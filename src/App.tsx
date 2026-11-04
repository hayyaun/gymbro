import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronLeft,
  Copy,
  Download,
  Dumbbell,
  FileText,
  LayoutGrid,
  LogOut,
  Moon,
  Plus,
  Search,
  Settings2,
  Sun,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { toPng } from "html-to-image";
import { exercise, newPlan, uid, useStore } from "./model";
import type { Day, Plan } from "./model";
import PlanSheet, { weekdays } from "./PlanSheet";
import SheetPreview from "./SheetPreview";
import ExirBrand from "./ExirBrand";
import PwaControls from "./PwaControls";
import { forgePalettes, forgeVariables } from "./forgeTheme";
import type { ForgeAccent } from "./forgeTheme";
import { protocolVariables } from "./protocolTheme";
import ProtocolDesignControls from "./ProtocolDesignControls";
import { activeWeek, assignTrainingWeek, getWeekdaySession, resizeTrainingWeek } from "./trainingWeek";
import { SortableSession, SortableSessions } from "./SortableSessions";
import { studentKey, studentsFromPlans } from "./students";
import "./App.css";
import "./DashboardStudents.css";

const templates = [
  { id: "studio", name: "استودیو", text: "قدرتمند و حرفه ای" },
  { id: "forge", name: "فورج", text: "پوستر انیمه · تیره و روشن" },
  { id: "protocol", name: "پروتکل", text: "صنعتی · تایپوگرافی و الگو" },
];
const fa = (n: number) => n.toLocaleString("fa-IR");
function App() {
  const { coach, plans, heroDismissed, dismissHero, setCoach, save, remove } = useStore();
  const [draft, setDraft] = useState<Plan | null>(null);
  const [baseline, setBaseline] = useState("");
  const [query, setQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [tab, setTab] = useState("details");
  const [collapsedDays, setCollapsedDays] = useState<Set<string>>(() => new Set());
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState<(() => void) | null>(null);
  const [deleting, setDeleting] = useState<Plan | null>(null);
  const [pendingWeek, setPendingWeek] = useState<{ selected: boolean[]; weekday: number } | null>(null);
  const [exporting, setExporting] = useState(false);
  const [loginName, setLoginName] = useState("");
  const [storageError, setStorageError] = useState("");
  const sheet = useRef<HTMLDivElement>(null);
  const dirty = !!draft && JSON.stringify(draft) !== baseline;
  const students = studentsFromPlans(plans);
  const activeStudent = students.some((student) => student.name === selectedStudent)
    ? selectedStudent
    : null;
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 3500);
    return () => clearTimeout(timer);
  }, [notice]);
  const navigate = (action: () => void) => {
    if (dirty) setPending(() => action);
    else action();
  };
  const open = (plan: Plan, fresh = false) => {
    setDraft(structuredClone(plan));
    setBaseline(fresh ? "" : JSON.stringify(plan));
    setTab("details");
    setCollapsedDays(new Set(plan.days.slice(1).map((day) => day.id)));
    window.scrollTo({ top: 0 });
  };
  const selectStudent = (name: string | null) => navigate(() => {
    setDraft(null);
    setSelectedStudent(name);
    setQuery("");
    window.scrollTo({ top: 0 });
  });
  const startStudentPlan = () => open({ ...newPlan(), athlete: activeStudent ?? "" }, true);
  const patch = (data: Partial<Plan>) =>
    setDraft((d) => (d ? { ...d, ...data } : d));
  const patchDay = (id: string, data: Partial<Day>) =>
    draft &&
    patch({
      days: draft.days.map((d) => (d.id === id ? { ...d, ...data } : d)),
    });
  const applyWeek = (selected: boolean[]) => {
    if (!draft) return;
    patch(resizeTrainingWeek(draft, selected, () => ({ id: uid(), name: "", focus: "", exercises: [exercise()] })));
    setPendingWeek(null);
  };
  const toggleWeekday = (index: number) => {
    if (!draft) return;
    const selected = activeWeek(draft);
    selected[index] = !selected[index];
    if (!selected[index]) setPendingWeek({ selected, weekday: index });
    else applyWeek(selected);
  };
  const moveSession = (from: number, to: number) => {
    if (!draft) return;
    const days = [...draft.days];
    const [moved] = days.splice(from, 1);
    days.splice(to, 0, moved);
    patch(assignTrainingWeek(days, activeWeek(draft)));
  };
  const persistPlan = () => {
    if (!draft) return false;
    if (
      !draft.title.trim() ||
      !draft.athlete.trim() ||
      !draft.weeks ||
      Number(draft.weeks) < 1 ||
      Number(draft.weeks) > 52 ||
      draft.days.length === 0 ||
      draft.days.some(
        (d) =>
          !d.name.trim() ||
          !d.exercises.length ||
          d.exercises.some(
            (e) =>
              !e.name.trim() ||
              !e.sets.trim() ||
              !e.reps.trim() ||
              !e.rest.trim(),
          ),
      )
    ) {
      setNotice("نام برنامه، ورزشکار، مدت، روزهای تمرین و مشخصات حرکت ها را کامل کنید");
      return false;
    }
    const next = { ...draft, updatedAt: new Date().toISOString() };
    try {
      save(next);
      setDraft(next);
      setBaseline(JSON.stringify(next));
      setNotice("برنامه با موفقیت ذخیره شد");
      return true;
    } catch {
      setStorageError(
        "ذخیره انجام نشد. فضای مرورگر را بررسی کنید و دوباره تلاش کنید.",
      );
      return false;
    }
  };
  const exportImage = async () => {
    if (!sheet.current) return;
    setExporting(true);
    try {
      await document.fonts.ready;
      const url = await toPng(sheet.current, {
        pixelRatio: 3,
        backgroundColor: "#ffffff",
      });
      const a = document.createElement("a");
      a.download = `${draft?.athlete || "gymbro"}-workout.png`;
      a.href = url;
      a.click();
      setNotice("خروجی تصویر آماده شد");
    } catch {
      setNotice("ساخت تصویر ناموفق بود. دوباره تلاش کنید.");
    } finally {
      setExporting(false);
    }
  };
  if (!coach)
    return (
      <div className="login" dir="rtl">
        <PwaControls onUpdateRequested={(action) => action()} />
        <div className="login-art">
          <Dumbbell size={64} />
          <h1>
            هر پیشرفت بزرگ،
            <br />
            از یک برنامه شروع می شود.
          </h1>
          <span dir="ltr">BUILT BY COACHES. MADE FOR PROGRESS.</span>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (loginName.trim()) {
              try {
                setCoach(loginName.trim());
              } catch {
                setStorageError("دسترسی به فضای ذخیره مرورگر ممکن نیست");
              }
            }
          }}
        >
          <Brand />
          <span className="eyebrow">فضای کار مربی ها</span>
          <h2>به جیم برو خوش آمدید</h2>
          <p>برنامه های حرفه ای بنویسید. پیشرفت بسازید.</p>
          <label>
            نام مربی
            <input
              autoFocus
              required
              maxLength={60}
              value={loginName}
              onChange={(e) => setLoginName(e.target.value)}
              placeholder="نام و نام خانوادگی شما"
            />
          </label>
          <button className="primary">
            ورود به فضای کار <ArrowLeft size={18} />
          </button>
          <small>
            ورود محلی است؛ برنامه ها در همین مرورگر نگهداری می شوند.
          </small>
          {storageError && <p role="alert">{storageError}</p>}
        </form>
      </div>
    );
  const visible = plans.filter(
    (p) =>
      `${p.title} ${p.athlete}`.includes(query) &&
      (activeStudent === null || studentKey(p.athlete) === activeStudent),
  );
  return (
    <div className="app" dir="rtl">
      <PwaControls onUpdateRequested={navigate} />
      <aside className="sidebar">
        <Brand />
        <span className="workspace-label">فضای کار مربی</span>
        <nav>
          <button
            className={!draft && activeStudent === null ? "nav-active" : ""}
            onClick={() => selectStudent(null)}
          >
            <LayoutGrid size={19} />
            برنامه های من <span>{fa(plans.length)}</span>
          </button>
          <button
            aria-label="ساخت برنامه جدید"
            onClick={() => navigate(startStudentPlan)}
          >
            <Plus size={19} />
            ساخت برنامه جدید
          </button>
        </nav>
        <section className="sidebar-students" aria-label="لیست شاگردها">
          <div className="students-heading"><Users size={14} /><h2>شاگردها</h2><span>{fa(students.length)}</span></div>
          <div className="student-list">
            {students.map((student) => (
              <button
                key={student.name}
                className={`student-link${!draft && activeStudent === student.name ? " student-active" : ""}`}
                aria-label={`برنامه های ${student.name}`}
                aria-pressed={!draft && activeStudent === student.name}
                title={`${student.name} · ${fa(student.count)} برنامه`}
                onClick={() => selectStudent(student.name)}
              >
                <span className="student-avatar" aria-hidden="true">{student.name[0]}</span>
                <span className="student-name">{student.name}</span>
                <span className="student-count">{fa(student.count)}</span>
              </button>
            ))}
            {students.length === 0 && <p className="students-empty">با ذخیره اولین برنامه، نام شاگرد اینجا اضافه می شود.</p>}
          </div>
        </section>
        <div className="sidebar-bottom">
          <div className="local-note">
            <span className="status-dot" /> فضای شخصی شما
            <small>ذخیره در همین مرورگر</small>
          </div>
          <button
            className="profile"
            aria-label="خروج از فضای کار"
            onClick={() =>
              navigate(() => {
                try {
                  setCoach("");
                } catch {
                  setNotice("خروج ناموفق بود");
                }
              })
            }
          >
            <span className="avatar">{coach[0]}</span>
            <span>
              <b>{coach}</b>
              <small>مربی بدنسازی</small>
            </span>
            <LogOut size={17} />
          </button>
        </div>
      </aside>
      <main>
        <header className="topbar">
          <div className="breadcrumb">
            فضای کار <ChevronLeft size={14} />
            <b>{draft ? "ویرایش برنامه" : "برنامه های من"}</b>
          </div>
          <span className="top-tag">
            <span className="status-dot" /> مدیریت برنامه های تمرینی
          </span>
        </header>
        {!draft ? (
          <div className="dashboard">
            <div className="page-heading">
              <div>
                <span className="eyebrow">فضای کار مربی</span>
                <h1>
                  برنامه های من<span className="heading-dot">.</span>
                </h1>
                <p>برنامه های شاگردها را اینجا پیدا و ویرایش کنید.</p>
              </div>
              <button className="primary" onClick={startStudentPlan}>
                <Plus size={19} />
                برنامه جدید
              </button>
            </div>
            {!heroDismissed && <section className="hero-banner">
              <div>
                <span className="hero-label">
                  <span />
                  برنامه های تمرینی، یک جا
                </span>
                <h2>
                  برنامه هر شاگرد را
                  <br />
                  <em>همین جا آماده کنید.</em>
                </h2>
                <p>جلسه ها و حرکت ها را مشخص کنید و از برنامه خروجی عکس بگیرید.</p>
                <button onClick={startStudentPlan}>
                  ساخت برنامه جدید <ArrowLeft size={17} />
                </button>
              </div>
              <div className="hero-graphic" aria-hidden="true">
                <div className="orbit o1" />
                <div className="orbit o2" />
                <div className="orbit o3" />
                <Dumbbell />
                <span className="graphic-plus">+</span>
                <span className="graphic-caption">PLAN. TRAIN. REPEAT.</span>
              </div>
              <span className="hero-index">01 / PROGRESS</span>
              <button
                className="hero-dismiss"
                aria-label="بستن همیشگی کادر راهنما"
                title="این کادر دیگر نمایش داده نشود"
                onClick={() => {
                  try { dismissHero(); }
                  catch { setStorageError("ذخیره تنظیمات انجام نشد. فضای مرورگر را بررسی کنید."); }
                }}
              ><X size={17} /></button>
            </section>}
            <div className="stats">
              <Stat
                icon={<FileText />}
                value={fa(plans.length)}
                label="برنامه نوشته شده"
              />
              <Stat
                icon={<Users />}
                value={fa(students.length)}
                label="شاگرد"
              />
              <Stat
                icon={<Dumbbell />}
                value={fa(plans.reduce((n, p) => n + p.days.length, 0))}
                label="جلسه تمرینی"
              />
            </div>
            <div className="library-heading">
              <h2>
                {activeStudent ? `برنامه های ${activeStudent}` : "برنامه های شاگردها"} <span>{fa(visible.length)}</span>
              </h2>
              <label className="search">
                <Search size={18} />
                <input
                  placeholder="جستجوی برنامه یا ورزشکار..."
                  aria-label="جستجوی برنامه"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
            </div>
            <div className="filters student-filters" role="group" aria-label="فیلتر بر اساس شاگرد">
              <button className={activeStudent === null ? "selected" : ""} aria-pressed={activeStudent === null} onClick={() => setSelectedStudent(null)}>همه شاگردها <span>{fa(plans.length)}</span></button>
              {students.map((student) => (
                <button
                  key={student.name}
                  className={activeStudent === student.name ? "selected" : ""}
                  aria-pressed={activeStudent === student.name}
                  title={student.name}
                  onClick={() => setSelectedStudent(student.name)}
                >
                  <span className="filter-name">{student.name}</span><span>{fa(student.count)}</span>
                </button>
              ))}
            </div>
            <div className="plan-grid">
              {visible.map((p) => (
                <article className="plan-card" key={p.id}>
                  <button
                    className={`card-preview preview-${p.template}`}
                    onClick={() => open(p)}
                    aria-label={`باز کردن ${p.title}`}
                  >
                    <div
                      className={`mini-sheet${
                        p.template === "forge"
                          ? ` mini-forge forge-${p.forgeMode ?? "dark"}`
                          : p.template === "protocol"
                            ? ` mini-protocol protocol-${p.protocolMode ?? "paper"}`
                            : ""
                      }`}
                      style={(
                        p.template === "forge"
                          ? forgeVariables(p.forgeAccent, p.forgeMode)
                          : p.template === "protocol"
                            ? protocolVariables(p.protocolAccent)
                            : { "--accent": p.color }
                      ) as React.CSSProperties}
                    >
                      <div className="mini-head">
                        {p.template === "forge" ? (
                          <div className="mini-forge-title"><Dumbbell size={12} /><b>قوی تر از دیروز</b></div>
                        ) : p.template === "protocol" ? (
                          <b>پروتکل تمرین</b>
                        ) : <ExirBrand compact />}
                        <span>{p.athlete}</span>
                      </div>
                      <div className="mini-days">
                        {p.days.slice(0, 4).map((d, i) => (
                          <div key={d.id}>
                            <b>
                              {d.name}
                              <span>0{i + 1}</span>
                            </b>
                            {d.exercises.slice(0, 5).map((e) => (
                              <span key={e.id}>
                                {e.name}
                                <i>
                                  {e.sets} × {e.reps}
                                </i>
                              </span>
                            ))}
                          </div>
                        ))}
                      </div>
                      <div className="mini-footer">{p.template === "protocol" ? "طراحی اختصاصی · باشگاه اکسیر" : "PLAN. TRAIN. REPEAT."}</div>
                    </div>
                    <span className="template-badge">
                      {templates.find((t) => t.id === p.template)?.name}
                    </span>
                  </button>
                  <div className="card-info">
                    <span className="card-goal">
                      {p.goal} · {fa(p.days.length)} روز در هفته
                    </span>
                    <button className="card-title" onClick={() => open(p)}>
                      {p.title}
                    </button>
                    <p>
                      <Users size={14} />
                      {p.athlete}
                    </p>
                    <div className="card-bottom">
                      <small>
                        {new Date(p.updatedAt).toLocaleDateString("fa-IR", {
                          month: "long",
                          day: "numeric",
                        })}
                      </small>
                      <div onClick={(event) => event.stopPropagation()}>
                        <button
                          className="icon-button"
                          aria-label={`کپی ${p.title}`}
                          onClick={() =>
                            open(
                              {
                                ...structuredClone(p),
                                id: uid(),
                                title: `${p.title} (کپی)`,
                              },
                              true,
                            )
                          }
                        >
                          <Copy size={16} />
                        </button>
                        <button
                          className="icon-button"
                          aria-label={`حذف ${p.title}`}
                          onClick={() => setDeleting(p)}
                        >
                          <Trash2 size={16} />
                        </button>
                        <button className="edit-link" onClick={() => open(p)}>
                          ویرایش <ArrowLeft size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
              <button
                className="new-card"
                onClick={startStudentPlan}
              >
                <span>
                  <Plus size={26} />
                </span>
                <b>{activeStudent ? `برنامه جدید برای ${activeStudent}` : "ساخت برنامه جدید"}</b>
                <small>روزهای تمرین و حرکت ها را مشخص کنید</small>
              </button>
            </div>
            {visible.length === 0 && (
              <p className="empty">
                برنامه ای پیدا نشد. یک برنامه جدید بسازید یا جستجو را تغییر
                دهید.
              </p>
            )}
            <footer className="app-footer">
              <span>برنامه ها در این مرورگر ذخیره می شوند.</span>
              <span dir="ltr">GYMBRO © {new Date().getFullYear()}</span>
            </footer>
          </div>
        ) : (
          <div className="editor">
            <div className="editor-heading">
              <button
                className="icon-button"
                aria-label="بازگشت به برنامه ها"
                onClick={() => navigate(() => setDraft(null))}
              >
                <ArrowRight />
              </button>
              <div>
                <h1>{draft.title || "برنامه جدید"}</h1>
                <small className={dirty ? "unsaved" : ""}>
                  {dirty ? "تغییرات ذخیره نشده" : "همه تغییرات ذخیره شده"}
                </small>
              </div>
              <div className="editor-actions">
                <button
                  className="secondary"
                  onClick={exportImage}
                  disabled={exporting}
                >
                  <Download size={17} />
                  {exporting ? "در حال ساخت..." : "خروجی عکس"}
                </button>
                <button className="primary" onClick={persistPlan}>
                  <Check size={18} />
                  ذخیره برنامه
                </button>
              </div>
            </div>
            <div className="editor-layout">
              <section className="editor-panel">
                <div className="editor-tabs">
                  {[
                    { id: "details", title: "مشخصات" },
                    { id: "workout", title: "تمرین ها" },
                    { id: "design", title: "ظاهر برنامه" },
                  ].map((t) => (
                    <button
                      className={tab === t.id ? "active" : ""}
                      onClick={() => setTab(t.id)}
                      key={t.id}
                    >
                      {t.title}
                    </button>
                  ))}
                </div>
                {tab === "details" && (
                  <div className="panel-content">
                    <h2>هر ورزشکار، یک مسیر</h2>
                    <p>جزئیات برنامه اختصاصی را وارد کنید.</p>
                    <label>
                      نام برنامه
                      <input
                        maxLength={100}
                        value={draft.title}
                        onChange={(e) => patch({ title: e.target.value })}
                        placeholder="مثلا دوره افزایش حجم"
                      />
                    </label>
                    <label>
                      نام ورزشکار
                      <input
                        maxLength={80}
                        value={draft.athlete}
                        onChange={(e) => patch({ athlete: e.target.value })}
                        placeholder="نام و نام خانوادگی"
                      />
                    </label>
                    <div className="two-fields">
                      <label>
                        هدف
                        <select
                          value={draft.goal}
                          onChange={(e) => patch({ goal: e.target.value })}
                        >
                          {[
                            "عضله سازی",
                            "افزایش قدرت",
                            "کاهش وزن",
                            "آمادگی عمومی",
                          ].map((g) => (
                            <option key={g}>{g}</option>
                          ))}
                        </select>
                      </label>
                      <label>
                        مدت (هفته)
                        <input
                          type="number"
                          min="1"
                          max="52"
                          value={draft.weeks}
                          onChange={(e) => patch({ weeks: e.target.value })}
                        />
                      </label>
                    </div>
                    <label>
                      تمرین هوازی
                      <textarea
                        value={draft.cardio}
                        onChange={(e) => patch({ cardio: e.target.value })}
                        placeholder="تعداد جلسات، مدت و شدت..."
                      />
                    </label>
                    <label>
                      یادداشت مربی
                      <textarea
                        value={draft.notes}
                        onChange={(e) => patch({ notes: e.target.value })}
                        placeholder="نکات مهم برای ورزشکار..."
                      />
                    </label>
                    <section className="week-selection">
                    <div className="week-selection-heading"><h3>روزهای تمرین</h3><span>{fa(activeWeek(draft).filter(Boolean).length)} جلسه در هفته</span></div>
                    <p className="week-help">هر روز انتخاب شده یک جلسه است؛ ترتیب از شنبه شروع می شود.</p>
                    <div className="weekday-picker" role="group" aria-label="روزهای تمرین">
                      {weekdays.map((d, i) => (
                        <button key={d} type="button" aria-pressed={activeWeek(draft)[i]} onClick={() => toggleWeekday(i)}>
                          <b>{d}</b>
                          <small>{activeWeek(draft)[i] ? `جلسه ${fa(activeWeek(draft).slice(0, i + 1).filter(Boolean).length)}` : "استراحت"}</small>
                        </button>
                      ))}
                    </div>
                    <p className="week-warning">با غیرفعال کردن هر روز، جلسه همان روز پس از تایید حذف می شود.</p>
                    </section>
                  </div>
                )}
                {tab === "workout" && (
                  <div className="panel-content">
                    <div className="section-title">
                      <h2>جلسه های تمرینی</h2>
                      <span>{fa(draft.days.length)} روز</span>
                    </div>
                    <p className="week-help">برای جابجایی، دستگیره شش نقطه ای جلسه را نگه دارید و بکشید. ترتیب جلسه ها در تقویم هم به روز می شود.</p>
                    <SortableSessions onMove={moveSession}>
                    {draft.days.map((day, i) => (
                      <SortableSession id={day.id} index={i} key={day.id}>{(handle) => <>
                        <div className="day-editor-heading">
                          {handle}
                          <button
                            className="day-toggle"
                            aria-expanded={!collapsedDays.has(day.id)}
                            aria-controls={`day-fields-${day.id}`}
                            aria-label={`${collapsedDays.has(day.id) ? "باز کردن" : "جمع کردن"} ${day.name || `جلسه ${fa(i + 1)}`}`}
                            onClick={() => setCollapsedDays((current) => {
                              const next = new Set(current);
                              if (next.has(day.id)) next.delete(day.id);
                              else next.add(day.id);
                              return next;
                            })}
                          >
                            <ChevronDown size={18} />
                            <span>
                              <b>{day.name || `جلسه ${fa(i + 1)}`}</b>
                              <small>{day.focus || "جلسه تمرینی"} · {fa(day.exercises.length)} حرکت</small>
                            </span>
                          </button>
                        </div>
                        <div id={`day-fields-${day.id}`} className="day-editor-fields" hidden={collapsedDays.has(day.id)}>
                        <div className="two-fields">
                          <div className="day-position"><span>روز تمرین</span><b>{weekdays.filter((_, index) => activeWeek(draft)[index])[i] || day.name}</b></div>
                          <label>
                            تمرکز جلسه
                            <input
                              value={day.focus}
                              onChange={(e) =>
                                patchDay(day.id, { focus: e.target.value })
                              }
                            />
                          </label>
                        </div>
                        {day.exercises.map((ex, j) => (
                          <div className="exercise-editor" key={ex.id}>
                            <div className="exercise-top">
                              <span>{fa(j + 1)}</span>
                              <input
                                aria-label={`نام حرکت ${j + 1} جلسه ${i + 1}`}
                                placeholder="نام حرکت"
                                value={ex.name}
                                onChange={(e) =>
                                  patchDay(day.id, {
                                    exercises: day.exercises.map((x) =>
                                      x.id === ex.id
                                        ? { ...x, name: e.target.value }
                                        : x,
                                    ),
                                  })
                                }
                              />
                              <button
                                className="icon-button"
                                aria-label={`حذف حرکت ${j + 1} جلسه ${i + 1}`}
                                onClick={() =>
                                  patchDay(day.id, {
                                    exercises: day.exercises.filter(
                                      (x) => x.id !== ex.id,
                                    ),
                                  })
                                }
                              >
                                <X size={15} />
                              </button>
                            </div>
                            <div className="exercise-fields">
                              {(
                                [
                                  { key: "sets", label: "ست" },
                                  { key: "reps", label: "تکرار" },
                                  { key: "rest", label: "استراحت (ثانیه)" },
                                  { key: "group", label: "سوپرست" },
                                ] as const
                              ).map(({ key, label }) => (
                                <label key={key}>
                                  {label}
                                  <input
                                    value={ex[key]}
                                    placeholder={key === "group" ? "A / B" : ""}
                                    onChange={(e) =>
                                      patchDay(day.id, {
                                        exercises: day.exercises.map((x) =>
                                          x.id === ex.id
                                            ? { ...x, [key]: e.target.value }
                                            : x,
                                        ),
                                      })
                                    }
                                  />
                                </label>
                              ))}
                            </div>
                            <input
                              className="note-input"
                              aria-label={`توضیح حرکت ${j + 1} جلسه ${i + 1}`}
                              value={ex.note}
                              placeholder="توضیح حرکت (اختیاری)"
                              onChange={(e) =>
                                patchDay(day.id, {
                                  exercises: day.exercises.map((x) =>
                                    x.id === ex.id
                                      ? { ...x, note: e.target.value }
                                      : x,
                                  ),
                                })
                              }
                            />
                          </div>
                        ))}
                        <button
                          className="add-exercise"
                          onClick={() =>
                            patchDay(day.id, {
                              exercises: [...day.exercises, exercise()],
                            })
                          }
                        >
                          <Plus size={16} />
                          افزودن حرکت
                        </button>
                        </div>
                      </>}</SortableSession>
                    ))}
                    </SortableSessions>
                    <button
                      className="secondary full"
                      onClick={() => setTab("details")}
                    >
                      <Settings2 size={17} />
                      انتخاب روزهای تمرین از مشخصات
                    </button>
                  </div>
                )}
                {tab === "design" && (
                  <div className="panel-content">
                    <h2>با امضای شما</h2>
                    <p>قالب و رنگ برنامه را انتخاب کنید.</p>
                    {templates.map((t) => (
                      <button
                        className={`template-option ${draft.template === t.id ? "chosen" : ""}`}
                        onClick={() => patch({ template: t.id })}
                        key={t.id}
                      >
                        <span className={`template-swatch swatch-${t.id}`}>
                          <FileText />
                        </span>
                        <span>
                          <b>{t.name}</b>
                          <small>{t.text}</small>
                        </span>
                        {draft.template === t.id && <Check size={18} />}
                      </button>
                    ))}
                    {draft.template === "forge" ? (
                      <>
                        <h3>پس زمینه برنامه</h3>
                        <div className="appearance-modes" role="group" aria-label="پس زمینه برنامه">
                          {([
                            { id: "dark", name: "تیره", icon: Moon },
                            { id: "light", name: "روشن", icon: Sun },
                          ] as const).map(({ id, name, icon: Icon }) => (
                            <button key={id} className={(draft.forgeMode ?? "dark") === id ? "chosen" : ""} aria-pressed={(draft.forgeMode ?? "dark") === id} onClick={() => patch({ forgeMode: id })}><Icon size={18} />{name}<Check size={15} /></button>
                          ))}
                        </div>
                        <h3>رنگ تم فورج</h3>
                        <div className="appearance-palettes" role="group" aria-label="رنگ تم فورج">
                          {(Object.entries(forgePalettes) as [ForgeAccent, typeof forgePalettes[ForgeAccent]][]).map(([id, palette]) => (
                            <button key={id} className={(draft.forgeAccent ?? "purple") === id ? "chosen" : ""} aria-pressed={(draft.forgeAccent ?? "purple") === id} onClick={() => patch({ forgeAccent: id })}><i style={{ background: palette.color, color: palette.ink }}>{(draft.forgeAccent ?? "purple") === id && <Check size={14} />}</i>{palette.name}</button>
                          ))}
                        </div>
                        <p className="appearance-note">رنگ و پس زمینه فقط روی این قالب اعمال می شوند. تعداد جلسه ها و حرکت ها تغییری نمی کند.</p>
                      </>
                    ) : draft.template === "protocol" ? (
                      <ProtocolDesignControls plan={draft} onChange={patch} />
                    ) : (
                      <>
                    <h3>رنگ اختصاصی</h3>
                    <div className="colors">
                      {[
                        "#dc3045",
                        "#28735b",
                        "#3562c4",
                        "#8b4ab0",
                        "#be6b23",
                        "#202b38",
                      ].map((c) => (
                        <button
                          key={c}
                          style={{ background: c }}
                          aria-label={`رنگ ${c}`}
                          onClick={() => patch({ color: c })}
                        >
                          {draft.color === c && <Check size={17} />}
                        </button>
                      ))}
                      <input
                        aria-label="رنگ دلخواه"
                        type="color"
                        value={draft.color}
                        onChange={(e) => patch({ color: e.target.value })}
                      />
                    </div>
                      </>
                    )}
                  </div>
                )}
              </section>
              <section className={`preview-panel${draft.template === "protocol" ? " protocol-preview" : ""}`}>
                <div className="preview-label">
                  <span>
                    <Settings2 size={15} />
                    پیش نمایش زنده
                  </span>
                  <small>خروجی تصویر با کیفیت سه برابر</small>
                </div>
                <SheetPreview sheetRef={sheet}>
                  <PlanSheet plan={draft} coach={coach} />
                </SheetPreview>
                <p className="preview-hint">
                  تغییرات شما همین جا نمایش داده می شوند.
                </p>
              </section>
            </div>
          </div>
        )}
      </main>
      {notice && (
        <div className="toast" role="status">
          {notice}
          <button aria-label="بستن پیام" onClick={() => setNotice("")}>
            <X size={16} />
          </button>
        </div>
      )}
      {storageError && (
        <Modal title="ذخیره ناموفق" onClose={() => setStorageError("")}>
          <p>{storageError}</p>
          <button className="primary" onClick={() => setStorageError("")}>
            متوجه شدم
          </button>
        </Modal>
      )}
      {pendingWeek && draft && (
        <Modal title={`غیرفعال کردن ${weekdays[pendingWeek.weekday]}`} onClose={() => setPendingWeek(null)}>
          <p>جلسه تمرین {weekdays[pendingWeek.weekday]} ({getWeekdaySession(draft, pendingWeek.weekday)?.name || "جلسه تمرین"}) و تمام {fa(getWeekdaySession(draft, pendingWeek.weekday)?.exercises.length ?? 0)} حرکت داخل آن حذف می شود.</p>
          <p>تمرین روزهای دیگر حفظ می شود و شماره جلسه ها به روز می شود. با ذخیره برنامه، این حذف ثبت می شود.</p>
          <div className="modal-actions">
            <button className="danger" onClick={() => applyWeek(pendingWeek.selected)}>حذف جلسه همین روز</button>
            <button className="secondary" onClick={() => setPendingWeek(null)}>انصراف</button>
          </div>
        </Modal>
      )}
      {pending && (
        <Modal
          title="تغییرات را ذخیره نکرده اید"
          onClose={() => setPending(null)}
        >
          <p>قبل از خروج، برنامه را ذخیره کنید تا تغییرات شما از دست نرود.</p>
          <div className="modal-actions">
            <button
              className="primary"
              onClick={() => {
                if (persistPlan()) {
                  const action = pending;
                  setPending(null);
                  action();
                }
              }}
            >
              ذخیره و خروج
            </button>
            <button
              className="danger"
              onClick={() => {
                const action = pending;
                setPending(null);
                action();
              }}
            >
              خروج بدون ذخیره
            </button>
            <button className="secondary" onClick={() => setPending(null)}>
              ادامه ویرایش
            </button>
          </div>
        </Modal>
      )}
      {deleting && (
        <Modal title="این برنامه حذف شود؟" onClose={() => setDeleting(null)}>
          <p>برنامه «{deleting.title}» از این مرورگر حذف می شود.</p>
          <div className="modal-actions">
            <button
              className="danger"
              onClick={() => {
                try {
                  remove(deleting.id);
                  setDeleting(null);
                  setNotice("برنامه حذف شد");
                } catch {
                  setStorageError("حذف برنامه ناموفق بود");
                }
              }}
            >
              حذف برنامه
            </button>
            <button className="secondary" onClick={() => setDeleting(null)}>
              انصراف
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
function Brand() {
  return (
    <div className="brand" dir="ltr">
      <span className="brand-icon">
        <Dumbbell size={22} />
      </span>
      GYM<b>BRO</b>
      <i>.</i>
    </div>
  );
}
function Stat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="stat">
      <span>{icon}</span>
      <div>
        <b>{value}</b>
        <small>{label}</small>
      </div>
    </div>
  );
}
function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current!;
    dialog.showModal();
    return () => dialog.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className="modal"
      dir="rtl"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <button
        className="modal-close icon-button"
        aria-label="بستن"
        onClick={onClose}
      >
        <X size={19} />
      </button>
      <h2>{title}</h2>
      {children}
    </dialog>
  );
}
export default App;
