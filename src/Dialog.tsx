import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { X } from "lucide-react";

export default function Dialog({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current!;
    dialog.showModal();
    return () => dialog.close();
  }, []);
  return <dialog ref={ref} className="modal" dir="rtl" onCancel={(event) => { event.preventDefault(); onClose(); }}>
    <button className="modal-close icon-button" aria-label="بستن" onClick={onClose}><X size={19} /></button>
    <h2>{title}</h2>{children}
  </dialog>;
}
