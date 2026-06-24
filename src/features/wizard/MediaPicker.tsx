import { AlertCircle, Film, Image as ImageIcon, Loader2 } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useMedia } from '@/lib/hooks'
import { Input } from '@/components/ui/Field'

interface MediaPickerProps {
  /** Filtra para Reels quando o gatilho é de Reel. */
  filter: 'reel' | 'post' | 'all'
  /** Valor atual (permalink ou id da mídia). */
  value: string
  onChange: (ref: string) => void
}

function isReel(mediaProductType: string | null, mediaType: string) {
  return mediaProductType === 'REELS' || mediaType === 'VIDEO'
}

/**
 * Lista as mídias reais da conta conectada para escolher o alvo do gatilho.
 * Cai num campo de texto manual se a API falhar (ex.: token sem permissão).
 */
export function MediaPicker({ filter, value, onChange }: MediaPickerProps) {
  const { data, isLoading, isError } = useMedia()

  if (isLoading) {
    return (
      <div className="grid h-28 place-items-center rounded-xl border border-border bg-canvas">
        <Loader2 className="size-5 animate-spin text-brand-600" />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="rounded-xl border border-border bg-canvas p-4">
        <p className="mb-2 flex items-center gap-2 text-xs text-warning">
          <AlertCircle className="size-4" />
          Não foi possível listar suas mídias. Informe o link/ID manualmente.
        </p>
        <Input
          placeholder='Ex.: https://instagram.com/reel/... ou ID da mídia'
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    )
  }

  const items = data.filter((m) =>
    filter === 'all'
      ? true
      : filter === 'reel'
        ? isReel(m.mediaProductType, m.mediaType)
        : !isReel(m.mediaProductType, m.mediaType),
  )

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-canvas p-4 text-sm text-ink-soft">
        Nenhuma mídia encontrada para esse tipo. Publique um{' '}
        {filter === 'reel' ? 'Reel' : 'post'} ou informe o link manualmente:
        <Input
          className="mt-2"
          placeholder="Link ou ID da mídia"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    )
  }

  return (
    <div className="grid max-h-72 grid-cols-3 gap-2 overflow-y-auto rounded-xl border border-border bg-canvas p-2 sm:grid-cols-4">
      {items.map((m) => {
        const ref = m.id
        const selected = value === m.id || value === m.permalink
        return (
          <button
            key={m.id}
            type="button"
            onClick={() => onChange(ref)}
            className={cn(
              'group relative aspect-square overflow-hidden rounded-lg border bg-surface transition-all',
              selected
                ? 'border-brand-500 ring-2 ring-brand-200'
                : 'border-border hover:border-border-strong',
            )}
            title={m.caption ?? m.id}
          >
            {m.thumbnailUrl ? (
              <img
                src={m.thumbnailUrl}
                alt={m.caption ?? ''}
                className="size-full object-cover"
              />
            ) : (
              <div className="grid size-full place-items-center text-ink-muted">
                {isReel(m.mediaProductType, m.mediaType) ? (
                  <Film className="size-5" />
                ) : (
                  <ImageIcon className="size-5" />
                )}
              </div>
            )}
            {isReel(m.mediaProductType, m.mediaType) && (
              <span className="absolute left-1 top-1 rounded bg-ink/70 px-1 py-0.5 text-[9px] font-medium text-white">
                Reel
              </span>
            )}
            {selected && (
              <span className="absolute inset-0 grid place-items-center bg-brand-600/20">
                <span className="rounded-full bg-brand-600 p-1 text-white">
                  ✓
                </span>
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
