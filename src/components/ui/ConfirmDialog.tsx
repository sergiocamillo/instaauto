import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from './Button'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

/** Lightweight modal confirmation for destructive actions. */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Excluir',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCancel()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onCancel])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <div className="absolute inset-0 bg-ink/40" onClick={onCancel} />
      <div className="animate-in relative w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-[var(--shadow-pop)]">
        <div className="mb-4 grid size-11 place-items-center rounded-full bg-danger-soft text-danger">
          <AlertTriangle className="size-5" />
        </div>
        <h3 className="text-lg font-semibold text-ink">{title}</h3>
        <p className="mt-1.5 text-sm text-ink-soft">{description}</p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
