import {
  forwardRef,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
  type ReactNode,
} from 'react'
import { cn } from '@/lib/cn'

const fieldBase =
  'w-full rounded-lg border border-border-strong bg-surface px-3 text-sm text-ink placeholder:text-ink-muted ' +
  'transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 ' +
  'disabled:cursor-not-allowed disabled:opacity-60'

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input ref={ref} className={cn(fieldBase, 'h-10', className)} {...props} />
))
Input.displayName = 'Input'

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(fieldBase, 'min-h-[88px] py-2.5 leading-relaxed', className)}
    {...props}
  />
))
Textarea.displayName = 'Textarea'

export function Label({
  children,
  htmlFor,
  hint,
}: {
  children: ReactNode
  htmlFor?: string
  hint?: string
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 flex items-center gap-2 text-sm font-medium text-ink"
    >
      {children}
      {hint && <span className="font-normal text-ink-muted">{hint}</span>}
    </label>
  )
}

export function FormError({ children }: { children?: ReactNode }) {
  if (!children) return null
  return <p className="mt-1.5 text-xs text-danger">{children}</p>
}
