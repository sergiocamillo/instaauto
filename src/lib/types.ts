/**
 * Domain types for InstaAuto.
 *
 * These intentionally mirror the planned Supabase schema so that swapping the
 * mock store for real tables later is a drop-in change:
 *   profiles · connected_accounts · automations · automation_triggers ·
 *   automation_actions · contacts · messages · files · tags · contact_tags ·
 *   analytics_events
 *
 * Every record carries a `user_id` to model row-level ownership (RLS-ready).
 */

export type ID = string

/* ----------------------------- Triggers ----------------------------- */

export type TriggerType =
  | 'reel_comment_specific'
  | 'reel_comment_any'
  | 'post_comment_specific'
  | 'post_comment_any'
  | 'story_reply'
  | 'dm_new'
  | 'dm_keyword'

export type KeywordMatch = 'any' | 'specific'

export interface AutomationTrigger {
  id: ID
  automation_id: ID
  type: TriggerType
  /** Reel/post id the trigger is scoped to, when the type is "specific". */
  target_ref?: string
  keyword_match: KeywordMatch
  /** Words/expressions that fire the automation when match === 'specific'. */
  keywords: string[]
}

/* ------------------------------ Actions ------------------------------ */

export type ActionType =
  | 'send_dm'
  | 'send_link'
  | 'send_file'
  | 'save_contact'
  | 'add_tag'
  | 'reply_with_button'
  | 'reply_comment'

export interface AutomationAction {
  id: ID
  automation_id: ID
  type: ActionType
  order: number
  /** Free-form, type-dependent configuration (message text, link, file id…). */
  config: {
    message?: string
    /** Texto da resposta pública ao comentário (ação reply_comment). */
    comment_reply?: string
    link?: string
    file_id?: ID
    tag?: string
    button_label?: string
    /** Follow-up message sent after the button is clicked. */
    button_followup?: string
  }
}

/* ---------------------------- Automation ----------------------------- */

export type AutomationStatus = 'active' | 'inactive'

export interface Automation {
  id: ID
  user_id: ID
  name: string
  status: AutomationStatus
  trigger: AutomationTrigger
  actions: AutomationAction[]
  /** Denormalized analytics for fast listing. */
  executions: number
  clicks: number
  last_run_at: string | null
  created_at: string
}

/** CTR helper derived from executions/clicks. */
export function ctr(a: Pick<Automation, 'executions' | 'clicks'>): number {
  if (!a.executions) return 0
  return Math.round((a.clicks / a.executions) * 1000) / 10
}

/* ------------------------------ Contacts ----------------------------- */

export interface Contact {
  id: ID
  user_id: ID
  name: string
  username: string
  origin: string
  keyword_used: string | null
  automation_name: string | null
  tags: string[]
  first_interaction_at: string
  last_interaction_at: string
}

/* ------------------------------ Messages ----------------------------- */

export type MessageStatus = 'sent' | 'delivered' | 'failed' | 'pending'

export interface Message {
  id: ID
  user_id: ID
  contact_id: ID
  contact_name: string
  contact_username: string
  automation_name: string
  body: string
  status: MessageStatus
  created_at: string
}

/* ------------------------------- Files ------------------------------- */

export type FileType = 'pdf' | 'image' | 'video' | 'document'

export interface StoredFile {
  id: ID
  user_id: ID
  name: string
  type: FileType
  url: string
  size_label: string
  created_at: string
}

/* ----------------------- Connected accounts -------------------------- */

export type ConnectionStatus = 'connected' | 'disconnected'

export interface ConnectedAccount {
  id: ID
  user_id: ID
  platform: 'instagram' | 'facebook'
  handle: string
  status: ConnectionStatus
}

/* --------------------------- Analytics ------------------------------- */

export interface AnalyticsPoint {
  /** ISO date (day granularity). */
  date: string
  interactions: number
  messages: number
}
