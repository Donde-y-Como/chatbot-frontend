const notification = new Audio('/notification.mp3')

export function playNotification() {
  notification.currentTime = 0
  notification.play().catch(() => {})
}