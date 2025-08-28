<template>
  <teleport to="body">
    <div class="fixed top-4 right-4 z-50 space-y-2 pointer-events-none max-w-sm sm:max-w-md">
      <transition-group
        name="notification"
        tag="div"
        @enter="onEnter"
        @leave="onLeave"
      >
        <div
          v-for="notification in notifications"
          :key="notification.id"
          class="pointer-events-auto"
        >
          <div
            :class="[
              'flex items-start gap-3 p-4 rounded-lg shadow-xl backdrop-blur-sm border',
              notificationClasses[notification.type]
            ]"
          >
            <!-- Icon -->
            <div class="flex-shrink-0">
              <!-- Success Icon -->
              <svg v-if="notification.type === 'success'" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              
              <!-- Error Icon -->
              <svg v-else-if="notification.type === 'error'" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
              
              <!-- Warning Icon -->
              <svg v-else-if="notification.type === 'warning'" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
              
              <!-- Info Icon -->
              <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
            </div>
            
            <!-- Content -->
            <div class="flex-1 min-w-0">
              <p v-if="notification.title" class="text-sm font-semibold text-white">
                {{ notification.title }}
              </p>
              <p class="text-sm text-gray-300 mt-0.5">
                {{ notification.message }}
              </p>
            </div>
            
            <!-- Close Button -->
            <button
              @click="removeNotification(notification.id)"
              class="flex-shrink-0 ml-2 text-gray-400 hover:text-white transition-colors"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </transition-group>
    </div>
  </teleport>
</template>

<script setup>
import { computed } from 'vue'
import { useNotificationStore } from '@/stores/notification'

const notificationStore = useNotificationStore()

const notifications = computed(() => notificationStore.notifications)

const notificationClasses = {
  success: 'bg-gray-800/90 border-green-500 text-green-400',
  error: 'bg-gray-800/90 border-red-500 text-red-400',
  warning: 'bg-gray-800/90 border-yellow-500 text-yellow-400',
  info: 'bg-gray-800/90 border-blue-500 text-blue-400'
}

const removeNotification = (id) => {
  notificationStore.remove(id)
}

// Animation hooks
const onEnter = (el) => {
  el.style.height = 'auto'
  const height = el.offsetHeight
  el.style.height = 0
  el.style.opacity = 0
  
  setTimeout(() => {
    el.style.transition = 'all 0.3s ease'
    el.style.height = height + 'px'
    el.style.opacity = 1
  })
}

const onLeave = (el) => {
  el.style.transition = 'all 0.3s ease'
  el.style.height = 0
  el.style.opacity = 0
}
</script>

<style scoped>
/* Mobile adjustments */
@media (max-width: 640px) {
  .fixed {
    left: 1rem;
    right: 1rem;
    top: 4rem; /* Below header */
  }
}

/* Animation classes */
.notification-enter-active {
  transition: all 0.3s ease;
}

.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.notification-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.notification-move {
  transition: transform 0.3s ease;
}
</style>