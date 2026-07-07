export interface ApiMeta {
  timestamp: string
  request_id: string
  page?: number
  limit?: number
  total?: number
  total_pages?: number
}

export interface ApiResponse<T = unknown> {
  success: boolean
  code: number
  message: string
  data: T | null
  meta: ApiMeta
  errors?: Array<{ field: string; message: string }>
}

const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL ?? '/api').replace(/\/+$/, '')

const AUTH_TOKEN_STORAGE_KEY = 'prabz_token'

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)
}

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'

export const api = async <T = unknown>(
  method: HttpMethod,
  endpoint: string,
  payload?: unknown
): Promise<T> => {
  const token = getAuthToken()
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`

  const options: RequestInit = { method, headers }
  if (payload && method !== 'GET') options.body = JSON.stringify(payload)

  const res = await fetch(`${baseUrl}${endpoint}`, options)

  const json = await res.json() as ApiResponse<T>

  if (!res.ok) {
    throw new Error(json?.message ?? res.statusText)
  }

  return json.data as T
}
