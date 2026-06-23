import {
  MessageCircle,
  Film,
  Image,
  Images,
  MessageSquareReply,
  Inbox,
  Hash,
  Send,
  Link2,
  FileDown,
  UserPlus,
  Tag,
  MousePointerClick,
  MessageSquare,
  type LucideIcon,
} from 'lucide-react'
import type { ActionType, TriggerType } from './types'

export interface CatalogEntry<T extends string> {
  value: T
  label: string
  description: string
  icon: LucideIcon
  /** Whether the trigger targets one specific reel/post. */
  needsTarget?: boolean
}

export const TRIGGERS: CatalogEntry<TriggerType>[] = [
  {
    value: 'reel_comment_specific',
    label: 'Comentário em Reel específico',
    description: 'Dispara quando alguém comenta em um Reel que você escolher.',
    icon: Film,
    needsTarget: true,
  },
  {
    value: 'reel_comment_any',
    label: 'Comentário em qualquer Reel',
    description: 'Dispara em comentários de qualquer Reel do seu perfil.',
    icon: Film,
  },
  {
    value: 'post_comment_specific',
    label: 'Comentário em publicação específica',
    description: 'Dispara quando alguém comenta em uma publicação escolhida.',
    icon: Image,
    needsTarget: true,
  },
  {
    value: 'post_comment_any',
    label: 'Comentário em qualquer publicação',
    description: 'Dispara em comentários de qualquer publicação do feed.',
    icon: Images,
  },
  {
    value: 'story_reply',
    label: 'Resposta em Story',
    description: 'Dispara quando alguém responde a um Story por DM.',
    icon: MessageSquareReply,
  },
  {
    value: 'dm_new',
    label: 'Nova DM recebida',
    description: 'Dispara a cada nova mensagem direta recebida.',
    icon: Inbox,
  },
  {
    value: 'dm_keyword',
    label: 'Palavra-chave enviada na DM',
    description: 'Dispara quando uma palavra-chave chega por DM.',
    icon: Hash,
  },
]

export const ACTIONS: CatalogEntry<ActionType>[] = [
  {
    value: 'send_dm',
    label: 'Enviar mensagem por DM',
    description: 'Envia uma mensagem direta automática.',
    icon: Send,
  },
  {
    value: 'send_link',
    label: 'Enviar link',
    description: 'Entrega um link configurado por você.',
    icon: Link2,
  },
  {
    value: 'send_file',
    label: 'Enviar arquivo',
    description: 'Entrega um PDF, imagem, vídeo ou documento.',
    icon: FileDown,
  },
  {
    value: 'save_contact',
    label: 'Salvar contato',
    description: 'Adiciona quem interagiu à sua base de contatos.',
    icon: UserPlus,
  },
  {
    value: 'add_tag',
    label: 'Adicionar tag',
    description: 'Marca o contato com uma etiqueta para segmentar.',
    icon: Tag,
  },
  {
    value: 'reply_with_button',
    label: 'Enviar resposta com botão',
    description: 'Mensagem com um botão clicável e follow-up.',
    icon: MousePointerClick,
  },
  {
    value: 'reply_comment',
    label: 'Responder o comentário',
    description: 'Responde publicamente no próprio comentário.',
    icon: MessageSquare,
  },
]

export const triggerLabel = (t: TriggerType) =>
  TRIGGERS.find((x) => x.value === t)?.label ?? t

export const triggerIcon = (t: TriggerType) =>
  TRIGGERS.find((x) => x.value === t)?.icon ?? MessageCircle

export const actionLabel = (a: ActionType) =>
  ACTIONS.find((x) => x.value === a)?.label ?? a

export const actionIcon = (a: ActionType) =>
  ACTIONS.find((x) => x.value === a)?.icon ?? Send
