import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronLeft,
  Copy,
  Download,
  Dumbbell,
  FileText,
  LayoutGrid,
  LogOut,
  Plus,
  Search,
  Settings2,
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
import "./App.css";

const templates = [
  { id: "studio", name: "استودیو", text: "قدرتمند و حرفه ای" },
  { id: "minimal", name: "مینیمال", text: "ساده و منظم" },
  { id: "bold", name: "بولد", text: "متفاوت و پرانرژی" },
];
const fa = (n: number) => n.toLocaleString("fa-IR");
function App() {
  const { coach, plans, setCoach, save, remove } = useStore();
  const [draft, setDraft] = useState<Plan | null>(null);
  const [baseline, setBaseline] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [tab, setTab] = useState("details");
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState<(() => void) | null>(null);
  const [deleting, setDeleting] = useState<Plan | null>(null);
  const [exporting, setExporting] = useState(false);
  const [loginName, setLoginName] = useState("");
  const [storageError, setStorageError] = useState("");
  const sheet = useRef<HTMLDivElement>(null);
  const dirty = !!draft && JSON.stringify(draft) !== baseline;
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
    window.scrollTo({ top: 0 });
  };
  const patch = (data: Partial<Plan>) =>
    setDraft((d) => (d ? { ...d, ...data } : d));
  const patchDay = (id: string, data: Partial<Day>) =>
    draft &&
    patch({
      days: draft.days.map((d) => (d.id === id ? { ...d, ...data } : d)),
    });
  const persistPlan = () => {
    if (!draft) return false;
    if (
      !draft.title.trim() ||
      !draft.athlete.trim() ||
      !draft.weeks ||
      Number(draft.weeks) < 1 ||
      Number(draft.weeks) > 52 ||
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
      setNotice("نام برنامه، ورزشکار، مدت و مشخصات حرکت ها را کامل کنید");
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
      (filter === "all" || p.template === filter),
  );
  return (
    <div className="app" dir="rtl">
      <PwaControls onUpdateRequested={navigate} />
      <aside className="sidebar">
        <Brand />
        <span className="workspace-label">فضای کار مربی</span>
        <nav>
          <button
            className="nav-active"
            onClick={() => navigate(() => setDraft(null))}
          >
            <LayoutGrid size={19} />
            برنامه های من <span>{fa(plans.length)}</span>
          </button>
          <button
            aria-label="ساخت برنامه جدید"
            onClick={() => navigate(() => open(newPlan(), true))}
          >
            <Plus size={19} />
            ساخت برنامه جدید
          </button>
        </nav>
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
            <span className="status-dot" /> آماده برای یک شروع قوی
          </span>
        </header>
        {!draft ? (
          <div className="dashboard">
            <div className="page-heading">
              <div>
                <span className="eyebrow">YOUR COACHING STUDIO</span>
                <h1>
                  برنامه های من<span className="heading-dot">.</span>
                </h1>
                <p>هر برنامه، شروع یک تغییر بزرگ است.</p>
              </div>
              <button className="primary" onClick={() => open(newPlan(), true)}>
                <Plus size={19} />
                برنامه جدید
              </button>
            </div>
            <section className="hero-banner">
              <div>
                <span className="hero-label">
                  <span />
                  از برنامه تا پیشرفت
                </span>
                <h2>
                  شما مسیر را می سازید.
                  <br />
                  <em>ورزشکار، قوی تر می شود.</em>
                </h2>
                <p>برنامه تمرینی اختصاصی، با امضای خودتان.</p>
                <button onClick={() => open(newPlan(), true)}>
                  اولین قدم را بردارید <ArrowLeft size={17} />
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
            </section>
            <div className="stats">
              <Stat
                icon={<FileText />}
                value={fa(plans.length)}
                label="برنامه نوشته شده"
              />
              <Stat
                icon={<Users />}
                value={fa(new Set(plans.map((p) => p.athlete)).size)}
                label="ورزشکار"
              />
              <Stat
                icon={<Dumbbell />}
                value={fa(plans.reduce((n, p) => n + p.days.length, 0))}
                label="جلسه تمرینی"
              />
            </div>
            <div className="library-heading">
              <h2>
                کتابخانه برنامه ها <span>{fa(plans.length)}</span>
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
            <div className="filters">
              {[{ id: "all", name: "همه برنامه ها" }, ...templates].map((t) => (
                <button
                  key={t.id}
                  className={filter === t.id ? "selected" : ""}
                  onClick={() => setFilter(t.id)}
                >
                  {t.name}
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
                      className="mini-sheet"
                      style={{ "--accent": p.color } as React.CSSProperties}
                    >
                      <div className="mini-head">
                        <ExirBrand compact />
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
                      <div className="mini-footer">PLAN. TRAIN. REPEAT.</div>
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
                      <div>
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
                onClick={() => open(newPlan(), true)}
              >
                <span>
                  <Plus size={26} />
                </span>
                <b>برنامه بعدی شما</b>
                <small>یک شروع تازه برای یک هدف تازه</small>
              </button>
            </div>
            {visible.length === 0 && (
              <p className="empty">
                برنامه ای پیدا نشد. یک برنامه جدید بسازید یا جستجو را تغییر
                دهید.
              </p>
            )}
            <footer className="app-footer">
              <span>با دقت بنویسید. با قدرت پیش بروید.</span>
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
                    <h3>تقویم هفتگی</h3>
                    <div className="schedule-editor">
                      {weekdays.map((d, i) => (
                        <label key={d}>
                          {d}
                          <select
                            value={draft.schedule[i]}
                            onChange={(e) =>
                              patch({
                                schedule: draft.schedule.map((v, j) =>
                                  j === i ? e.target.value : v,
                                ),
                              })
                            }
                          >
                            <option>استراحت</option>
                            {draft.days.map((day) => (
                              <option key={day.id}>{day.name}</option>
                            ))}
                          </select>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                {tab === "workout" && (
                  <div className="panel-content">
                    <div className="section-title">
                      <h2>جلسه های تمرینی</h2>
                      <span>{fa(draft.days.length)} روز</span>
                    </div>
                    {draft.days.map((day, i) => (
                      <section className="day-editor" key={day.id}>
                        <div className="section-title">
                          <b>جلسه {fa(i + 1)}</b>
                          <button
                            className="icon-button"
                            disabled={draft.days.length === 1}
                            aria-label={`حذف ${day.name}`}
                            onClick={() =>
                              patch({
                                days: draft.days.filter((d) => d.id !== day.id),
                                schedule: draft.schedule.map((s) =>
                                  s === day.name ? "استراحت" : s,
                                ),
                              })
                            }
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <div className="two-fields">
                          <label>
                            نام روز
                            <input
                              value={day.name}
                              onChange={(e) => {
                                const name = e.target.value;
                                patch({
                                  days: draft.days.map((d) =>
                                    d.id === day.id ? { ...d, name } : d,
                                  ),
                                  schedule: draft.schedule.map((s) =>
                                    s === day.name ? name : s,
                                  ),
                                });
                              }}
                            />
                          </label>
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
                      </section>
                    ))}
                    <button
                      className="secondary full"
                      onClick={() =>
                        patch({
                          days: [
                            ...draft.days,
                            {
                              id: uid(),
                              name: `روز ${fa(draft.days.length + 1)}`,
                              focus: "",
                              exercises: [exercise()],
                            },
                          ],
                        })
                      }
                    >
                      <Plus size={17} />
                      افزودن جلسه تمرینی
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
                  </div>
                )}
              </section>
              <section className="preview-panel">
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
