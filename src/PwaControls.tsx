import { useEffect, useState } from "react";
import { Download, RefreshCw, X } from "lucide-react";
import { useRegisterSW } from "virtual:pwa-register/react";

interface InstallPromptEvent extends Event {
  prompt: () => Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PwaControls({
  onUpdateRequested,
}: {
  onUpdateRequested: (action: () => void) => void;
}) {
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(
    null,
  );
  const [dismissed, setDismissed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onOfflineReady() {
      console.info("Gymbro is ready for offline use");
    },
    onRegisterError(error) {
      console.warn("Gymbro offline registration failed", error);
    },
  });

  useEffect(() => {
    const ready = (event: Event) => {
      if (window.matchMedia("(display-mode: standalone)").matches) return;
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
      setDismissed(false);
    };
    const installed = () => setInstallPrompt(null);
    window.addEventListener("beforeinstallprompt", ready);
    window.addEventListener("appinstalled", installed);
    return () => {
      window.removeEventListener("beforeinstallprompt", ready);
      window.removeEventListener("appinstalled", installed);
    };
  }, []);

  if (!needRefresh && (!installPrompt || dismissed)) return null;
  const install = async () => {
    if (!installPrompt) return;
    try {
      await installPrompt.prompt();
      setInstallPrompt(null);
    } catch {
      setError("نصب انجام نشد. دوباره تلاش کنید.");
    }
  };
  const update = () =>
    onUpdateRequested(() => {
      setBusy(true);
      void updateServiceWorker(true).catch(() => {
        setBusy(false);
        setError("به روزرسانی انجام نشد. دوباره تلاش کنید.");
      });
    });
  return (
    <section className="pwa-controls" aria-label="نصب و به روزرسانی" dir="rtl">
      <button
        className="icon-button pwa-dismiss"
        aria-label="بستن پیشنهاد"
        onClick={() => {
          setNeedRefresh(false);
          setDismissed(true);
        }}
      >
        <X size={16} />
      </button>
      <b>
        {needRefresh
          ? "نسخه جدید جیم برو آماده است"
          : "جیم برو همیشه در دسترس شما"}
      </b>
      <p>
        {error ||
          (needRefresh
            ? "برای دریافت تغییرات، برنامه را به روز کنید."
            : "برنامه را نصب کنید و پس از اولین اجرا، آفلاین هم برنامه بنویسید.")}
      </p>
      <button
        className="primary"
        disabled={busy}
        onClick={needRefresh ? update : install}
      >
        {needRefresh ? <RefreshCw size={16} /> : <Download size={16} />}
        {busy
          ? "در حال به روزرسانی..."
          : needRefresh
            ? "به روزرسانی"
            : "نصب جیم برو"}
      </button>
    </section>
  );
}
