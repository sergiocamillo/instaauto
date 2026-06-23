import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

type Tone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'violet'

const tones: Record<Tone, string> = {
  neutral: 'bg-canvas text-ink-soft border-border',
  brand: 'bg-brand-50 text-brand-700 border-brand-100',
  success: 'bg-success-soft text-success border-transparent',
  warning: 'bg-warning-soft text-warning border-transparent',
  danger: 'bg-danger-soft text-danger border-transparent',
  violet: 'bg-violet-soft text-violet border-transparent',
}

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone
}

export function Badge({ tone = 'neutral', className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        tones[tone],
        className,
      )}
      {...props}
    />
  )
}

/** Active/inactive pill with a status dot. */
export function StatusBadge({ active }: { active: boolean }) {
  return (
    <Badge tone={active ? 'success' : 'neutral'}>
      <span
        className={cn(
          'size-1.5 rounded-full',
          active ? 'bg-success' : 'bg-ink-muted',
        )}
      />
      {active ? 'Ativo' : 'Inativo'}
    </Badge>
  )
}
