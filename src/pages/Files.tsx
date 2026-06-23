import { useRef, useState } from 'react'
import {
  FileText,
  ImageIcon,
  Video,
  File as FileIcon,
  Copy,
  Check,
  Plus,
  Trash2,
  FolderClosed,
  X,
  Upload,
} from 'lucide-react'
import {
  useFiles,
  useCreateFile,
  useDeleteFile,
  useUploadFile,
} from '@/lib/hooks'
import type { FileType } from '@/lib/types'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Label } from '@/components/ui/Field'
import { Badge } from '@/components/ui/Badge'
import { PageHeader, EmptyState } from '@/components/ui/Misc'
import { cn } from '@/lib/cn'

const typeMeta: Record<
  FileType,
  { label: string; icon: typeof FileText; className: string }
> = {
  pdf: { label: 'PDF', icon: FileText, className: 'bg-danger-soft text-danger' },
  image: {
    label: 'Imagem',
    icon: ImageIcon,
    className: 'bg-violet-soft text-violet',
  },
  video: { label: 'Vídeo', icon: Video, className: 'bg-brand-50 text-brand-600' },
  document: {
    label: 'Documento',
    icon: FileIcon,
    className: 'bg-warning-soft text-warning',
  },
}

export function Files() {
  const { data: files = [] } = useFiles()
  const deleteFile = useDeleteFile()
  const uploadFile = useUploadFile()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  function copy(url: string, id: string) {
    navigator.clipboard?.writeText(url)
    setCopied(id)
    setTimeout(() => setCopied(null), 1600)
  }

  function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = '' // permite reenviar o mesmo arquivo
    if (!file) return
    setUploadError(null)
    uploadFile.mutate(file, {
      onError: (err) => {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message ?? 'Falha ao enviar o arquivo.'
        setUploadError(Array.isArray(msg) ? msg[0] : msg)
      },
    })
  }

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={onPickFile}
      />
      <PageHeader
        title="Arquivos"
        description="Materiais que suas automações entregam por DM."
      >
        <Button
          variant="outline"
          onClick={() => setAdding(true)}
          disabled={uploadFile.isPending}
        >
          <Plus className="size-4" />
          Adicionar por URL
        </Button>
        <Button
          onClick={() => fileInputRef.current?.click()}
          loading={uploadFile.isPending}
        >
          {!uploadFile.isPending && <Upload className="size-4" />}
          Enviar do computador
        </Button>
      </PageHeader>

      {uploadError && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger">
          <X className="size-4 shrink-0" />
          {uploadError}
        </div>
      )}

      {files.length === 0 ? (
        <Card>
          <EmptyState
            icon={FolderClosed}
            title="Nenhum arquivo cadastrado"
            description="Adicione PDFs, imagens, vídeos ou documentos para entregar nas suas automações."
            action={
              <Button
                onClick={() => fileInputRef.current?.click()}
                loading={uploadFile.isPending}
              >
                {!uploadFile.isPending && <Upload className="size-4" />}
                Enviar do computador
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {files.map((f) => {
            const meta = typeMeta[f.type]
            return (
              <Card key={f.id} className="animate-in flex flex-col p-5">
                <div className="flex items-start justify-between">
                  <div
                    className={cn(
                      'grid size-11 place-items-center rounded-xl',
                      meta.className,
                    )}
                  >
                    <meta.icon className="size-5" />
                  </div>
                  <button
                    onClick={() => deleteFile.mutate(f.id)}
                    className="rounded-lg p-1.5 text-ink-muted hover:bg-canvas hover:text-danger"
                    aria-label="Excluir arquivo"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>

                <p className="mt-4 truncate text-sm font-semibold text-ink">
                  {f.name}
                </p>
                <div className="mt-1 flex items-center gap-2 text-xs text-ink-muted">
                  <Badge>{meta.label}</Badge>
                  <span>{f.size_label}</span>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <code className="min-w-0 flex-1 truncate rounded-lg bg-canvas px-2.5 py-2 text-xs text-ink-soft">
                    {f.url}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copy(f.url, f.id)}
                  >
                    {copied === f.id ? (
                      <>
                        <Check className="size-3.5 text-success" />
                        Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="size-3.5" />
                        Copiar
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {adding && <AddFileDialog onClose={() => setAdding(false)} />}
    </div>
  )
}

function AddFileDialog({ onClose }: { onClose: () => void }) {
  const createFile = useCreateFile()
  const [name, setName] = useState('')
  const [type, setType] = useState<FileType>('pdf')
  const [url, setUrl] = useState('')

  function save() {
    if (!name.trim() || !url.trim()) return
    createFile.mutate(
      { name: name.trim(), type, url: url.trim() },
      { onSuccess: onClose },
    )
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <Card className="animate-in relative w-full max-w-md p-6">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-ink">Adicionar arquivo</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-ink-muted hover:bg-canvas"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <Label>Nome</Label>
            <Input
              placeholder="Guia Completo de IA.pdf"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <Label>Tipo</Label>
            <div className="grid grid-cols-4 gap-2">
              {(Object.keys(typeMeta) as FileType[]).map((t) => {
                const meta = typeMeta[t]
                const active = type === t
                return (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    className={cn(
                      'flex flex-col items-center gap-1 rounded-lg border p-3 text-xs font-medium transition-colors',
                      active
                        ? 'border-brand-500 bg-brand-50 text-brand-700'
                        : 'border-border text-ink-soft hover:bg-canvas',
                    )}
                  >
                    <meta.icon className="size-4" />
                    {meta.label}
                  </button>
                )
              })}
            </div>
          </div>
          <div>
            <Label>URL</Label>
            <Input
              placeholder="https://files.instauto.app/arquivo.pdf"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={save} disabled={!name.trim() || !url.trim()}>
            Adicionar
          </Button>
        </div>
      </Card>
    </div>
  )
}
