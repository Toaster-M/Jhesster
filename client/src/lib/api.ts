const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> | undefined ?? {}),
  }
  const res = await fetch(`${BASE}${path}`, { ...options, headers })
  const data = await res.json() as { error?: string }
  if (!res.ok) throw new Error(data.error ?? 'Request failed')
  return data as T
}
