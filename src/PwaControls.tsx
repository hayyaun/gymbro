import { useEffect, useLayoutEffect, useRef, useState } from "react";
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
  const [registration, setRegistration] = useState<ServiceWorkerRegistration>();
  const updateBanner = useRef<HTMLElement>(null);
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registered) {
      setRegistration(registered);
    },
    onOfflineReady() {
      console.info("Gymbro is ready for offline use");
    },
    onRegisterError(error) {
      console.warn("Gymbro offline registration failed", error);
    },
  });

  useEffect(() => {
    if (!registration) return;
    const checkForUpdate = () => {
      if (
        !navigator.onLine ||
        document.visibilityState !== "visible" ||
        registration.installing ||
        registration.waiting
      ) return;
      void registration.update().catch((error) => {
        console.warn("Gymbro update check failed", error);
      });
    };
    const interval = window.setInterval(checkForUpdate, 5 * 60 * 1000);
    window.addEventListener("online", checkForUpdate);
    document.addEventListener("visibilitychange", checkForUpdate);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("online", checkForUpdate);
      document.removeEventListener("visibilitychange", checkForUpdate);
    };
  }, [registration]);

  useLayoutEffect(() => {
    const banner = updateBanner.current;
    if (!needRefresh || !banner) return;
    // Reserve the actual banner height, including wrapped text on small screens.
    const reserveSpace = () => {
      document.documentElement.style.setProperty(
        "--pwa-update-height",
        `${Math.ceil(banner.getBoundingClientRect().height)}px`,
      );
    };
    reserveSpace();
    const observer = new ResizeObserver(reserveSpace);
    observer.observe(banner);
    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty("--pwa-update-height");
    };
  }, [needRefresh]);

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
      setError("");
      setBusy(true);
      void updateServiceWorker(true).catch(() => {
        setBusy(false);
        setError("به روزرسانی انجام نشد. دوباره تلاش کنید.");
      });
    });
  if (needRefresh) {
    return (
      <section
        ref={updateBanner}
        className="pwa-update-banner"
        aria-label="به روزرسانی برنامه"
        aria-busy={busy}
        dir="rtl"
      >
        <RefreshCw size={21} aria-hidden="true" />
        <div role="status">
          <strong>نسخه جدید جیم برو آماده است</strong>
          <p>{error || "نسخه فعلی برنامه قدیمی است. برای دریافت آخرین تغییرات، برنامه را به روز کنید."}</p>
        </div>
        <button className="primary" disabled={busy} onClick={update}>
          {busy ? "در حال به روزرسانی..." : "به روزرسانی برنامه"}
        </button>
      </section>
    );
  }
  return (
    <section className="pwa-controls" aria-label="نصب برنامه" dir="rtl">
      <button
        className="icon-button pwa-dismiss"
        aria-label="بستن پیشنهاد"
        onClick={() => setDismissed(true)}
      >
        <X size={16} />
      </button>
      <b>جیم برو همیشه در دسترس شما</b>
      <p>
        {error || "برنامه را نصب کنید و پس از اولین اجرا، آفلاین هم برنامه بنویسید."}
      </p>
      <button className="primary" onClick={install}>
        <Download size={16} />
        نصب جیم برو
      </button>
    </section>
  );
}
