import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'

export function ConfirmDialog({ title, children, onClose, onConfirm, confirmLabel = 'အတည်ပြုမည်', danger = false }: { title: string; children: ReactNode; onClose: () => void; onConfirm: () => void; confirmLabel?: string; danger?: boolean }) {
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])
  return <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}>
    <div role="dialog" aria-modal="true" aria-labelledby="dialog-title" className="modal-panel">
      <div className="flex items-start justify-between gap-4"><h2 id="dialog-title" className="text-xl font-bold">{title}</h2><button className="icon-button" onClick={onClose} aria-label="ပိတ်မည်" title="ပိတ်မည်"><X size={20} /></button></div>
      <div className="mt-4 leading-loose text-muted">{children}</div>
      <div className="mt-6 flex justify-end gap-3"><button className="button-secondary" onClick={onClose}>မလုပ်တော့ပါ</button><button className={danger ? 'button-danger' : 'button-primary'} onClick={onConfirm}>{confirmLabel}</button></div>
    </div>
  </div>
}