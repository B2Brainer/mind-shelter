import axios from 'axios'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (typeof window !== 'undefined' && window.location.hostname
    ? `${window.location.protocol}//${window.location.hostname}:3001`
    : 'http://localhost:3001')

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export type SessionUser = {
  id: string
  email: string
  createdAt: string
  updatedAt: string
}

export type AuthResponse = {
  accessToken: string
  user: SessionUser
}

export type JournalEntry = {
  id: string
  title: string
  content: string
  entryDate: string
  type: 'DAILY' | 'GENERAL'
  userId: string
  createdAt: string
  updatedAt: string
}

export type JournalListResponse = {
  items: JournalEntry[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}

const withToken = (accessToken: string) => ({
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
})

export const authService = {
  register: async (email: string, password: string) => {
    const response = await api.post<SessionUser>('/auth/register', { email, password })
    return response.data
  },

  login: async (email: string, password: string) => {
    const response = await api.post<AuthResponse>('/auth/login', { email, password })
    return response.data
  },

  me: async (accessToken: string) => {
    const response = await api.get<SessionUser>('/auth/me', withToken(accessToken))
    return response.data
  },
}

export const journalService = {
  list: async (
    accessToken: string,
    filters: { type?: 'DAILY' | 'GENERAL' | ''; page?: number; pageSize?: number },
  ) => {
    const response = await api.get<JournalListResponse>('/journal-entries', {
      ...withToken(accessToken),
      params: {
        type: filters.type || undefined,
        page: filters.page ?? 1,
        pageSize: filters.pageSize ?? 10,
      },
    })
    return response.data
  },

  create: async (
    accessToken: string,
    payload: Pick<JournalEntry, 'title' | 'content' | 'entryDate' | 'type'>,
  ) => {
    const response = await api.post<JournalEntry>('/journal-entries', payload, withToken(accessToken))
    return response.data
  },

  update: async (
    accessToken: string,
    id: string,
    payload: Partial<Pick<JournalEntry, 'title' | 'content' | 'entryDate' | 'type'>>,
  ) => {
    const response = await api.patch<JournalEntry>(
      `/journal-entries/${id}`,
      payload,
      withToken(accessToken),
    )
    return response.data
  },

  remove: async (accessToken: string, id: string) => {
    await api.delete(`/journal-entries/${id}`, withToken(accessToken))
  },
}
