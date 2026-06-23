import { Check } from 'lucide-react'
import { cn } from '@/lib/cn'

interface StepperProps {
  steps: string[]
  current: number
  onStepClick?: (index: number) => void
}

export function Stepper({ steps, current, onStepClick }: StepperProps) {
  return (
    <ol className="flex items-center">
      {steps.map((label, i) => {
        const done = i < current
        const active = i === current
        const reachable = i <= current
        return (
          <li key={label} className="flex flex-1 items-center last:flex-none">
            <button
              type="button"
              disabled={!reachable}
              onClick={() => reachable && onStepClick?.(i)}
              className={cn(
                'flex items-center gap-2.5 text-left',
                reachable ? 'cursor-pointer' : 'cursor-default',
              )}
            >
              <span
                className={cn(
                  'grid size-8 shrink-0 place-items-center rounded-full border text-sm font-semibold transition-colors',
                  done && 'border-brand-600 bg-brand-600 text-white',
                  active && 'border-brand-600 bg-brand-50 text-brand-700',
                  !done && !active && 'border-border-strong bg-surface text-ink-muted',
                )}
              >
                {done ? <Check className="size-4" /> : i + 1}
              </span>
              <span
                className={cn(
                  'hidden text-sm font-medium sm:block',
                  active ? 'text-ink' : 'text-ink-muted',
                )}
              >
                {label}
              </span>
            </button>
            {i < steps.length - 1 && (
              <span
                className={cn(
                  'mx-3 h-px flex-1 transition-colors',
                  done ? 'bg-brand-500' : 'bg-border',
                )}
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}
