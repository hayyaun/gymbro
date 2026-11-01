import { useEffect, useRef, useState } from "react";
import type { ReactNode, RefObject } from "react";

// Scale the preview's parent only, so PNG capture retains the sheet's 800px width.
export default function SheetPreview({
  children,
  sheetRef,
}: {
  children: ReactNode;
  sheetRef: RefObject<HTMLDivElement | null>;
}) {
  const frame = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ scale: 1, height: 700 });
  useEffect(() => {
    const update = () => {
      if (!frame.current || !sheetRef.current) return;
      const scale = Math.min(1, frame.current.clientWidth / 800);
      setSize({ scale, height: sheetRef.current.offsetHeight * scale });
    };
    const observer = new ResizeObserver(update);
    if (frame.current) observer.observe(frame.current);
    if (sheetRef.current) observer.observe(sheetRef.current);
    return () => observer.disconnect();
  }, [sheetRef]);
  return (
    <div className="sheet-scroll">
      <div
        ref={frame}
        className="preview-frame"
        style={{ height: size.height }}
      >
        <div
          className="preview-scale"
          style={{ transform: `scale(${size.scale})` }}
        >
          <div className="sheet-export" ref={sheetRef}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
