import { defineStore } from 'pinia'

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    notifications: [],
    counter: 0
  }),

  actions: {
    add(notification) {
      const id = ++this.counter
      
      const defaultDuration = notification.type === 'error' ? 5000 : 3000
      
      const newNotification = {
        id,
        type: notification.type || 'info', // success, error, warning, info
        title: notification.title || '',
        message: notification.message || '',
        duration: notification.duration !== undefined ? notification.duration : defaultDuration,
        timestamp: Date.now()
      }
      
      this.notifications.push(newNotification)
      
      // Auto remove after duration (if duration is not 0)
      if (newNotification.duration > 0) {
        setTimeout(() => {
          this.remove(id)
        }, newNotification.duration)
      }
      
      return id
    },
    
    remove(id) {
      const index = this.notifications.findIndex(n => n.id === id)
      if (index > -1) {
        this.notifications.splice(index, 1)
      }
    },
    
    clear() {
      this.notifications = []
    },
    
    // Convenience methods
    success(message, title = '成功') {
      return this.add({ type: 'success', title, message })
    },
    
    error(message, title = '错误') {
      return this.add({ type: 'error', title, message })
    },
    
    warning(message, title = '警告') {
      return this.add({ type: 'warning', title, message })
    },
    
    info(message, title = '提示') {
      return this.add({ type: 'info', title, message })
    }
  }
})