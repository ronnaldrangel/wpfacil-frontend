const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

interface ApiOptions {
  headers?: Record<string, string>
  params?: Record<string, string>
  signal?: AbortSignal
}

function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("wpfacil_token")
}

function setToken(token: string) {
  localStorage.setItem("wpfacil_token", token)
  document.cookie = "wpfacil_auth=true; path=/; max-age=604800; SameSite=Lax"
}

function removeToken() {
  localStorage.removeItem("wpfacil_token")
  document.cookie = "wpfacil_auth=; path=/; max-age=0"
}

function clearAuth() {
  localStorage.removeItem("wpfacil_token")
  localStorage.removeItem("wpfacil_impersonating")
  localStorage.removeItem("wpfacil_impersonate_token")
  localStorage.removeItem("wpfacil_admin_token")
  document.cookie = "wpfacil_auth=; path=/; max-age=0"
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  options?: ApiOptions
): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options?.headers,
  }
  if (token && !headers["Authorization"]) {
    headers["Authorization"] = `Bearer ${token}`
  }

  let url = `${API_URL}${path}`
  if (options?.params) {
    const searchParams = new URLSearchParams(options.params)
    url += `?${searchParams.toString()}`
  }

  const timeout = AbortSignal.timeout(20_000)
  const signal = options?.signal ? AbortSignal.any([options.signal, timeout]) : timeout
  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
    signal,
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Error de conexión" }))
    const message = Array.isArray(error.message) ? error.message.join(", ") : error.message
    throw new Error(message || `Error ${res.status}`)
  }

  if (res.status === 204) return undefined as T
  return res.json()
}

const api = {
  get: <T>(path: string, options?: ApiOptions) => request<T>("GET", path, undefined, options),
  post: <T>(path: string, body?: unknown, options?: ApiOptions) => request<T>("POST", path, body, options),
  put: <T>(path: string, body?: unknown, options?: ApiOptions) => request<T>("PUT", path, body, options),
  patch: <T>(path: string, body?: unknown, options?: ApiOptions) => request<T>("PATCH", path, body, options),
  delete: <T>(path: string, options?: ApiOptions) => request<T>("DELETE", path, undefined, options),
}

export { api, setToken, removeToken, clearAuth, getToken }
