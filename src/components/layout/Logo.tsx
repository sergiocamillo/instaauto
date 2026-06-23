import { Zap } from 'lucide-react'
import { cn } from '@/lib/cn'

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div className="grid size-8 place-items-center rounded-lg bg-brand-600 text-white shadow-sm">
        <Zap className="size-[18px]" fill="currentColor" strokeWidth={0} />
      </div>
      <span className="text-[17px] font-bold tracking-tight text-ink">
        Insta<span className="text-brand-600">Auto</span>
      </span>
    </div>
  )
}
