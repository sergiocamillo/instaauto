import type { ReactNode } from 'react'
import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/cn'

/** Empty-state block used across list pages. */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 grid size-12 place-items-center rounded-full bg-brand-50 text-brand-600">
        <Icon className="size-6" />
      </div>
      <p className="text-[15px] font-semibold text-ink">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-ink-soft">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

/** Section heading with title + optional description and trailing slot. */
export function PageHeader({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children?: ReactNode
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-ink-soft">{description}</p>
        )}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  )
}

/** Small rounded icon tile used in cards/lists. */
export function IconTile({
  icon: Icon,
  className,
}: {
  icon: LucideIcon
  className?: string
}) {
  return (
    <div
      className={cn(
        'grid size-9 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600',
        className,
      )}
    >
      <Icon className="size-[18px]" />
    </div>
  )
}
