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

const MAX_VIDEO_SIZE = 2 * 1024 * 1024 * 1024

async function presignUpload(filename: string, contentType: string, sizeBytes: number) {
  if (!contentType.startsWith("video/")) {
    throw new Error("El archivo debe ser un video")
  }
  if (sizeBytes > MAX_VIDEO_SIZE) {
    throw new Error("El video no puede superar los 2GB")
  }
  return api.post<{ tempId: string; uploadUrl: string; key: string }>("/api/videos/presign", {
    filename,
    contentType,
    sizeBytes,
  })
}

async function createVideo(tempId: string, filename: string, sizeBytes: number) {
  return api.post<{ videoId: string; status: string }>("/api/videos", {
    tempId,
    filename,
    sizeBytes,
  })
}

function putToR2(
  uploadUrl: string,
  file: File,
  onProgress?: (pct: number, loaded: number, total: number) => void,
): { promise: Promise<void>; abort: () => void } {
  const xhr = new XMLHttpRequest()
  let host = "?"
  try { host = new URL(uploadUrl).host } catch {}
  console.log(`[R2 PUT] start -> host: ${host}, size: ${file.size} bytes, type: ${file.type}`)

  xhr.open("PUT", uploadUrl)
  xhr.setRequestHeader("Content-Type", file.type)

  const promise = new Promise<void>((resolve, reject) => {
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100), e.loaded, e.total)
      }
    }
    xhr.onload = () => {
      console.log(`[R2 PUT] onload -> status: ${xhr.status} ${xhr.statusText}`, xhr.responseText?.slice(0, 300))
      if (xhr.status >= 200 && xhr.status < 300) resolve()
      else reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`))
    }
    xhr.onerror = () => {
      console.error(`[R2 PUT] onerror -> status: ${xhr.status} ${xhr.statusText}`, {
        responseText: xhr.responseText?.slice(0, 500),
        responseURL: xhr.responseURL,
      })
      reject(new Error("Error de red al subir el video (revisa CORS del bucket R2)"))
    }
    xhr.onabort = () => {
      console.log("[R2 PUT] aborted")
      reject(new Error("Subida cancelada"))
    }
    xhr.send(file)
  })

  return { promise, abort: () => xhr.abort() }
}

export { api, setToken, removeToken, getToken, presignUpload, putToR2, createVideo }
