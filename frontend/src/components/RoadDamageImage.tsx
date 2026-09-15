import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Expand, X } from "lucide-react";

interface Props { src: string; alt: string; className?: string; children?: ReactNode; }

export default function RoadDamageImage({ src, alt, className = "", children }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    if (open) document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return <>
    <button type="button" onClick={() => setOpen(true)} className={"group relative block w-full overflow-hidden rounded-xl bg-surface-container " + className} aria-label="Expand road-image preview">
      <img src={src} alt={alt} className="block h-full w-full object-contain bg-surface-container" />
      {children}
      <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-on-surface/80 px-2 py-1 text-xs text-surface opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"><Expand size={14}/> Expand</span>
    </button>
    {open && createPortal(
      <div role="dialog" aria-modal="true" aria-label={alt} className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 p-4" onClick={() => setOpen(false)}>
        <button type="button" onClick={() => setOpen(false)} className="absolute right-5 top-5 rounded-full bg-white/15 p-3 text-white hover:bg-white/25" aria-label="Close image preview"><X size={22}/></button>
        <img src={src} alt={alt} onClick={(event) => event.stopPropagation()} className="max-h-[90vh] max-w-[94vw] rounded-lg object-contain shadow-2xl" />
      </div>,
      document.body
    )}
  </>;
}