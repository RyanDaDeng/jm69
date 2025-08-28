import { useNotificationStore } from '@/stores/notification'

export function useNotification() {
  const notificationStore = useNotificationStore()
  
  return {
    success: (message, title) => notificationStore.success(message, title),
    error: (message, title) => notificationStore.error(message, title),
    warning: (message, title) => notificationStore.warning(message, title),
    info: (message, title) => notificationStore.info(message, title),
    notify: (options) => notificationStore.add(options),
    clear: () => notificationStore.clear()
  }
}