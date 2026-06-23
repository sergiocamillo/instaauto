import { type LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Card } from '@/components/ui/Card'
import { formatNumber } from '@/lib/format'

interface StatCardProps {
  label: string
  value: number
  icon: LucideIcon
  /** Percentage delta vs. previous period. */
  delta?: number
  accent?: 'brand' | 'success' | 'violet' | 'warning'
  index?: number
}

const accents: Record<NonNullable<StatCardProps['accent']>, string> = {
  brand: 'bg-brand-50 text-brand-600',
  success: 'bg-success-soft text-success',
  violet: 'bg-violet-soft text-violet',
  warning: 'bg-warning-soft text-warning',
}

export function StatCard({
  label,
  value,
  icon: Icon,
  delta,
  accent = 'brand',
  index = 0,
}: StatCardProps) {
  const up = (delta ?? 0) >= 0
  return (
    <Card
      className="animate-in p-5"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className={cn('grid size-10 place-items-center rounded-lg', accents[accent])}>
          <Icon className="size-5" />
        </div>
        {delta !== undefined && (
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
              up ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger',
            )}
          >
            {up ? (
              <TrendingUp className="size-3" />
            ) : (
              <TrendingDown className="size-3" />
            )}
            {Math.abs(delta)}%
          </span>
        )}
      </div>
      <p className="mt-4 text-3xl font-semibold tracking-tight text-ink">
        {formatNumber(value)}
      </p>
      <p className="mt-1 text-sm text-ink-soft">{label}</p>
    </Card>
  )
}
