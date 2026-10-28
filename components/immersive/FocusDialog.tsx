'use client';
import { useEffect, useId, useRef, type ReactNode } from 'react';

export function FocusDialog({ title, onClose, children, className = '' }: { title: string; onClose: () => void; children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const titleId = useId();
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const dialog = ref.current;
    dialog?.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { dialog?.close(); document.body.style.overflow = overflow; previous?.focus(); };
  }, []);
  return <dialog ref={ref} className={`lia-dialog ${className}`} aria-labelledby={titleId} onCancel={event => { event.preventDefault(); closeRef.current(); }} onClick={event => { if (event.target === ref.current) { const rect = ref.current.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeRef.current(); } }}>
    <header><div><span className="lia-eyebrow">LIA.DOCTOR</span><h2 id={titleId}>{title}</h2></div><button type="button" className="lia-dialog-close" onClick={onClose} aria-label="Fechar painel">×</button></header>
    {children}
  </dialog>;
}
