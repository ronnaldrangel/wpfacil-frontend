const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

interface ApiOptions {
  headers?: Record<string, string>
  params?: Record<string, string>
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
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  let url = `${API_URL}${path}`
  if (options?.params) {
    const searchParams = new URLSearchParams(options.params)
    url += `?${searchParams.toString()}`
  }

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Error de conexión" }))
    throw new Error(error.message || `Error ${res.status}`)
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

export { api, setToken, removeToken, getToken }
