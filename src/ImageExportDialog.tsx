import { useState } from "react";
import { Share } from "lucide-react";
import Dialog from "./Dialog";
import "./ImageExportDialog.css";

export type ExportedImage = { url: string; file: File };

export default function ImageExportDialog({ image, onClose }: {
  image: ExportedImage;
  onClose: () => void;
}) {
  const [sharing, setSharing] = useState(false);
  const [shareError, setShareError] = useState(false);
  const shareData = { files: [image.file] };
  const canShare = typeof navigator.share === "function" && navigator.canShare?.(shareData);

  const shareImage = async () => {
    setSharing(true);
    setShareError(false);
    try {
      await navigator.share(shareData);
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) {
        setShareError(true);
      }
    } finally {
      setSharing(false);
    }
  };

  return (
    <Dialog title="خروجی تصویر آماده شد" onClose={onClose}>
      {canShare && (
        <button className="primary" disabled={sharing} onClick={shareImage}>
          <Share size={18} />
          ذخیره یا اشتراک گذاری
        </button>
      )}
      {shareError && <p role="alert">منوی اشتراک گذاری باز نشد. می توانید از خود تصویر استفاده کنید.</p>}
      <p>برای دیدن گزینه های ذخیره، انگشتتان را روی تصویر نگه دارید.</p>
      <img className="export-image-preview" src={image.url} alt="تصویر خروجی برنامه تمرینی" />
    </Dialog>
  );
}
