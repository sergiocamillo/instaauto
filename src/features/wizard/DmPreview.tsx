import { InstagramGlyph } from '@/components/icons/Brand'
import type { ActionType } from '@/lib/types'
import type { StoredFile } from '@/lib/types'

export interface PreviewDraft {
  triggerLabel: string
  keywords: string[]
  keywordMatch: 'any' | 'specific'
  actions: ActionType[]
  message?: string
  link?: string
  buttonLabel?: string
  buttonFollowup?: string
  file?: StoredFile
}

function Bubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-[80%] rounded-2xl rounded-bl-md bg-white px-3.5 py-2.5 text-[13px] leading-relaxed text-ink shadow-sm">
      {children}
    </div>
  )
}

/** Instagram-style chat preview reflecting the draft automation. */
export function DmPreview({ draft }: { draft: PreviewDraft }) {
  const sample = draft.keywords[0] ?? (draft.keywordMatch === 'any' ? 'Oi!' : 'LINK')
  const hasButton = draft.actions.includes('reply_with_button')

  return (
    <div className="mx-auto w-full max-w-[300px]">
      <div className="overflow-hidden rounded-[28px] border-[6px] border-ink bg-ink shadow-[var(--shadow-pop)]">
        <div className="rounded-t-[20px] bg-gradient-to-b from-[#fdf2f8] to-[#eef2ff] px-4 pb-3 pt-4">
          <div className="flex items-center gap-2">
            <div className="grid size-8 place-items-center rounded-full bg-gradient-to-tr from-[#f58529] via-[#dd2a7b] to-[#8134af] text-white">
              <InstagramGlyph className="size-4" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-ink">seu.perfil</p>
              <p className="text-[10px] text-ink-muted">Mensagem automática</p>
            </div>
          </div>
        </div>

        <div className="flex min-h-[320px] flex-col gap-2.5 bg-gradient-to-b from-[#eef2ff] to-[#faf5ff] p-3">
          {/* User trigger */}
          <div className="self-end rounded-2xl rounded-br-md bg-brand-600 px-3.5 py-2 text-[13px] text-white shadow-sm">
            {sample}
          </div>

          {/* Automation reply */}
          {draft.message ? (
            <Bubble>
              <span className="whitespace-pre-line">{draft.message}</span>
            </Bubble>
          ) : (
            <Bubble>
              <span className="text-ink-muted">
                Sua mensagem aparecerá aqui…
              </span>
            </Bubble>
          )}

          {hasButton && (
            <button className="max-w-[80%] rounded-xl border border-brand-200 bg-white px-3.5 py-2 text-[13px] font-semibold text-brand-700 shadow-sm">
              {draft.buttonLabel || 'Botão'}
            </button>
          )}

          {draft.actions.includes('send_link') && draft.link && (
            <Bubble>
              <span className="break-all font-medium text-brand-600 underline">
                {draft.link}
              </span>
            </Bubble>
          )}

          {hasButton && draft.buttonFollowup && (
            <Bubble>
              <span className="whitespace-pre-line">{draft.buttonFollowup}</span>
            </Bubble>
          )}

          {draft.actions.includes('send_file') && draft.file && (
            <Bubble>
              <span className="flex items-center gap-2">
                📎 <span className="font-medium">{draft.file.name}</span>
              </span>
            </Bubble>
          )}
        </div>
      </div>
      <p className="mt-3 text-center text-xs text-ink-muted">
        Pré-visualização ao vivo
      </p>
    </div>
  )
}
