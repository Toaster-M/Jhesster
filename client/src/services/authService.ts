const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api';
const TOKEN_KEY = 'jhesster_token';

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  rating: number;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

// ── Token storage ─────────────────────────────────────────────────────────────

export function saveToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function deleteToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// ── API helpers ───────────────────────────────────────────────────────────────

async function post<T>(path: string, body: unknown, auth = false): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? 'Request failed');
  return data.data as T;
}

async function get<T>(path: string): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? 'Request failed');
  return data.data as T;
}

// ── Auth endpoints ────────────────────────────────────────────────────────────

export async function register(username: string, email: string, password: string): Promise<AuthResponse> {
  const data = await post<AuthResponse>('/auth/register', { username, email, password });
  saveToken(data.token);
  return data;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const data = await post<AuthResponse>('/auth/login', { email, password });
  saveToken(data.token);
  return data;
}

export async function logout(): Promise<void> {
  try {
    await post('/auth/logout', {}, true);
  } finally {
    deleteToken();
  }
}

export async function fetchMe(): Promise<AuthUser> {
  return get<AuthUser>('/auth/me');
}
