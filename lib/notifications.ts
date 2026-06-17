export interface Notification {
  id: number
  text: string
  time: string
}

const KEY = "wpfacil_notifications"

export function getNotifications(): Notification[] {
  if (typeof window === "undefined") return []
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]")
  } catch {
    return []
  }
}

export function addNotification(text: string) {
  const notifs = getNotifications()
  notifs.unshift({
    id: Date.now(),
    text,
    time: new Date().toISOString(),
  })
  localStorage.setItem(KEY, JSON.stringify(notifs.slice(0, 20)))
}

export function clearNotifications() {
  if (typeof window === "undefined") return
  localStorage.removeItem(KEY)
}
