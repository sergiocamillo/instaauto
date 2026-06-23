import { api } from './api'
import type {
  Automation,
  AutomationAction,
  Contact,
  Message,
  StoredFile,
  AnalyticsPoint,
} from './types'

/**
 * Camada de acesso ao backend.
 *
 * O backend usa camelCase; o frontend foi construído em snake_case. As funções
 * abaixo adaptam as duas formas, mantendo os componentes existentes intactos.
 */

/* ----------------------------- Automations ---------------------------- */

interface ApiAutomation {
  id: string
  name: string
  status: 'active' | 'inactive'
  executions: number
  clicks: number
  lastRunAt: string | null
  createdAt: string
  trigger: {
    id: string
    type: Automation['trigger']['type']
    targetRef: string | null
    keywordMatch: 'any' | 'specific'
    keywords: string[]
  } | null
  actions: Array<{
    id: string
    type: AutomationAction['type']
    order: number
    config: AutomationAction['config']
  }>
}

function toAutomation(a: ApiAutomation): Automation {
  return {
    id: a.id,
    user_id: 'me',
    name: a.name,
    status: a.status,
    executions: a.executions,
    clicks: a.clicks,
    last_run_at: a.lastRunAt,
    created_at: a.createdAt,
    trigger: {
      id: a.trigger?.id ?? '',
      automation_id: a.id,
      type: a.trigger?.type ?? 'dm_keyword',
      target_ref: a.trigger?.targetRef ?? undefined,
      keyword_match: a.trigger?.keywordMatch ?? 'specific',
      keywords: a.trigger?.keywords ?? [],
    },
    actions: a.actions.map((act) => ({
      id: act.id,
      automation_id: a.id,
      type: act.type,
      order: act.order,
      config: act.config ?? {},
    })),
  }
}

export interface AutomationInput {
  name: string
  status?: 'active' | 'inactive'
  trigger: {
    type: Automation['trigger']['type']
    targetRef?: string
    keywordMatch: 'any' | 'specific'
    keywords: string[]
  }
  actions: Array<{
    type: AutomationAction['type']
    order?: number
    config: AutomationAction['config']
  }>
}

export const automationsApi = {
  async list(): Promise<Automation[]> {
    const { data } = await api.get<ApiAutomation[]>('/automations')
    return data.map(toAutomation)
  },
  async create(input: AutomationInput): Promise<Automation> {
    const { data } = await api.post<ApiAutomation>('/automations', input)
    return toAutomation(data)
  },
  async update(id: string, input: AutomationInput): Promise<Automation> {
    const { data } = await api.put<ApiAutomation>(`/automations/${id}`, input)
    return toAutomation(data)
  },
  async setStatus(id: string, status: 'active' | 'inactive') {
    const { data } = await api.patch<ApiAutomation>(
      `/automations/${id}/status`,
      { status },
    )
    return toAutomation(data)
  },
  async remove(id: string) {
    await api.delete(`/automations/${id}`)
  },
}

/* ------------------------------ Contacts ------------------------------ */

interface ApiContact {
  id: string
  name: string
  username: string
  origin: string
  keywordUsed: string | null
  automationName: string | null
  tags: string[]
  firstInteractionAt: string
  lastInteractionAt: string
}

function toContact(c: ApiContact): Contact {
  return {
    id: c.id,
    user_id: 'me',
    name: c.name,
    username: c.username,
    origin: c.origin,
    keyword_used: c.keywordUsed,
    automation_name: c.automationName,
    tags: c.tags,
    first_interaction_at: c.firstInteractionAt,
    last_interaction_at: c.lastInteractionAt,
  }
}

export const contactsApi = {
  async list(params?: { q?: string; tag?: string }): Promise<Contact[]> {
    const { data } = await api.get<ApiContact[]>('/contacts', { params })
    return data.map(toContact)
  },
}

/* ------------------------------ Messages ------------------------------ */

interface ApiMessage {
  id: string
  body: string
  status: Message['status']
  createdAt: string
  contactName: string
  contactUsername: string
  automationName: string
}

function toMessage(m: ApiMessage): Message {
  return {
    id: m.id,
    user_id: 'me',
    contact_id: '',
    contact_name: m.contactName,
    contact_username: m.contactUsername,
    automation_name: m.automationName,
    body: m.body,
    status: m.status,
    created_at: m.createdAt,
  }
}

export const messagesApi = {
  async list(status?: Message['status']): Promise<Message[]> {
    const { data } = await api.get<ApiMessage[]>('/messages', {
      params: status ? { status } : undefined,
    })
    return data.map(toMessage)
  },
}

/* -------------------------------- Files ------------------------------- */

interface ApiFile {
  id: string
  name: string
  type: StoredFile['type']
  url: string
  sizeLabel: string | null
  createdAt: string
}

function toFile(f: ApiFile): StoredFile {
  return {
    id: f.id,
    user_id: 'me',
    name: f.name,
    type: f.type,
    url: f.url,
    size_label: f.sizeLabel ?? '—',
    created_at: f.createdAt,
  }
}

export const filesApi = {
  async list(): Promise<StoredFile[]> {
    const { data } = await api.get<ApiFile[]>('/files')
    return data.map(toFile)
  },
  async create(input: {
    name: string
    type: StoredFile['type']
    url: string
    sizeLabel?: string
  }): Promise<StoredFile> {
    const { data } = await api.post<ApiFile>('/files', input)
    return toFile(data)
  },
  async remove(id: string) {
    await api.delete(`/files/${id}`)
  },
}

/* ------------------------------ Dashboard ----------------------------- */

export interface DashboardData {
  stats: {
    activeAutomations: number
    messagesSent: number
    commentsCaptured: number
    leads: number
  }
  series: AnalyticsPoint[]
}

export const dashboardApi = {
  async overview(): Promise<DashboardData> {
    const { data } = await api.get<DashboardData>('/dashboard')
    return data
  },
}

/* ------------------------------ Accounts ------------------------------ */

export interface AccountStatus {
  id: string
  platform: 'instagram' | 'facebook'
  handle: string
  status: 'connected' | 'disconnected'
  tokenExpiresAt: string | null
}

export const accountsApi = {
  async status(): Promise<AccountStatus[]> {
    const { data } = await api.get<AccountStatus[]>('/accounts/status')
    return data
  },
  async connect(provider: 'instagram' | 'facebook'): Promise<{ url: string }> {
    const { data } = await api.post<{ url: string }>('/accounts/connect', null, {
      params: { provider },
    })
    return data
  },
  async disconnect(platform: 'instagram' | 'facebook') {
    await api.post(`/accounts/disconnect/${platform}`)
  },
  async media(): Promise<MediaItem[]> {
    const { data } = await api.get<MediaItem[]>('/accounts/media')
    return data
  },
}

export interface MediaItem {
  id: string
  caption: string | null
  mediaType: string
  mediaProductType: string | null
  thumbnailUrl: string | null
  permalink: string | null
  timestamp: string | null
}
