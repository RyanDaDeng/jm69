<template>
  <teleport to="body">
    <transition name="modal-fade">
      <div 
        v-if="modelValue" 
        class="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        @click.self="handleBackdropClick"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/50"></div>
        
        <!-- Modal Content -->
        <div class="relative bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
          <!-- Icon (optional) -->
          <div v-if="icon || type" class="text-center mb-4">
            <div 
              class="mx-auto flex items-center justify-center w-16 h-16 rounded-full"
              :class="iconContainerClass"
            >
              <!-- Warning Icon (default for confirmations) -->
              <svg v-if="iconType === 'warning'" class="w-8 h-8" :class="iconClass" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
              
              <!-- Info Icon -->
              <svg v-else-if="iconType === 'info'" class="w-8 h-8" :class="iconClass" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
              
              <!-- Error/Danger Icon -->
              <svg v-else-if="iconType === 'error' || iconType === 'danger'" class="w-8 h-8" :class="iconClass" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
              
              <!-- Success Icon -->
              <svg v-else-if="iconType === 'success'" class="w-8 h-8" :class="iconClass" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>
          
          <!-- Title -->
          <h3 v-if="title" class="text-xl font-bold text-white mb-2 text-center">
            {{ title }}
          </h3>
          
          <!-- Message -->
          <div v-if="message" class="text-gray-300 mb-6 text-center">
            {{ message }}
          </div>
          
          <!-- Custom content slot -->
          <div v-if="$slots.default" class="mb-6">
            <slot></slot>
          </div>
          
          <!-- Buttons -->
          <div class="flex gap-3">
            <button
              @click="handleCancel"
              class="flex-1 py-2 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors cursor-pointer"
            >
              {{ cancelText }}
            </button>
            
            <button
              @click="handleConfirm"
              class="flex-1 py-2 px-4 rounded-lg font-medium transition-colors cursor-pointer"
              :class="confirmButtonClassComputed"
            >
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  
  title: {
    type: String,
    default: '确认操作'
  },
  
  message: {
    type: String,
    default: '您确定要执行此操作吗？'
  },
  
  confirmText: {
    type: String,
    default: '确认'
  },
  
  cancelText: {
    type: String,
    default: '取消'
  },
  
  // Icon type: 'warning', 'info', 'error', 'danger', 'success'
  type: {
    type: String,
    default: 'warning',
    validator: (value) => ['warning', 'info', 'error', 'danger', 'success', ''].includes(value)
  },
  
  // Custom icon (overrides type)
  icon: {
    type: String,
    default: ''
  },
  
  // Whether clicking backdrop closes the dialog
  closeOnBackdrop: {
    type: Boolean,
    default: true
  },
  
  // Custom confirm button class
  confirmButtonClass: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

// Computed icon type
const iconType = computed(() => {
  if (props.icon) return props.icon
  return props.type || 'warning'
})

// Icon classes based on type
const iconClass = computed(() => {
  const classes = {
    warning: 'text-yellow-500',
    info: 'text-blue-500',
    error: 'text-red-500',
    danger: 'text-red-500',
    success: 'text-green-500'
  }
  return classes[iconType.value] || 'text-gray-500'
})

// Icon container classes
const iconContainerClass = computed(() => {
  const classes = {
    warning: 'bg-yellow-500/20',
    info: 'bg-blue-500/20',
    error: 'bg-red-500/20',
    danger: 'bg-red-500/20',
    success: 'bg-green-500/20'
  }
  return classes[iconType.value] || 'bg-gray-500/20'
})

// Default confirm button class based on type
const confirmButtonClassComputed = computed(() => {
  if (props.confirmButtonClass) return props.confirmButtonClass
  
  const classes = {
    warning: 'bg-yellow-600 hover:bg-yellow-700 text-white',
    info: 'bg-blue-600 hover:bg-blue-700 text-white',
    error: 'bg-red-600 hover:bg-red-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white'
  }
  
  return classes[iconType.value] || 'bg-pink-600 hover:bg-pink-700 text-white'
})

// Methods
const close = () => {
  emit('update:modelValue', false)
}

const handleConfirm = () => {
  emit('confirm')
  close()
}

const handleCancel = () => {
  emit('cancel')
  close()
}

const handleBackdropClick = () => {
  if (props.closeOnBackdrop) {
    handleCancel()
  }
}
</script>

<style scoped>
/* Modal transition */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-active .relative,
.modal-fade-leave-active .relative {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-from .relative,
.modal-fade-leave-to .relative {
  transform: scale(0.95);
  opacity: 0;
}
</style>