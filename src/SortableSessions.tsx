import type { ReactNode } from "react";
import { GripVertical } from "lucide-react";
import { DragDropProvider } from "@dnd-kit/react";
import { useSortable, isSortable } from "@dnd-kit/react/sortable";
import { PointerSensor, PointerActivationConstraints } from "@dnd-kit/dom";

const pointer = PointerSensor.configure({
  activationConstraints(event) {
    return event.pointerType === "touch"
      ? [new PointerActivationConstraints.Delay({ value: 250, tolerance: 5 })]
      : [new PointerActivationConstraints.Distance({ value: 5 })];
  },
});

export function SortableSessions({ children, onMove }: { children: ReactNode; onMove: (from: number, to: number) => void }) {
  return (
    <DragDropProvider
      sensors={(defaults) => [...defaults.filter((sensor) => sensor !== PointerSensor), pointer]}
      onDragEnd={(event) => {
        if (event.canceled) return;
        const { source } = event.operation;
        if (isSortable(source) && source.initialIndex !== source.index) onMove(source.initialIndex, source.index);
      }}
    >{children}</DragDropProvider>
  );
}

export function SortableSession({ id, index, children }: { id: string; index: number; children: (handle: ReactNode) => ReactNode }) {
  const { ref, handleRef, isDragging } = useSortable({ id, index });
  return (
    <section ref={ref} className={`day-editor${isDragging ? " dragging" : ""}`}>
      {children(
        <button ref={handleRef} type="button" className="session-drag-handle" aria-label={`جابجایی جلسه ${index + 1}`} title="برای جابجایی نگه دارید و بکشید؛ با صفحه کلید Enter و کلیدهای جهت دار">
          <GripVertical size={20} />
        </button>,
      )}
    </section>
  );
}
