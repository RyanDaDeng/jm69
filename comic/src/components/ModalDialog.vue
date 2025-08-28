<template>
  <teleport to="body">
    <transition name="modal-fade">
      <div 
        v-if="modelValue" 
        class="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        @click.self="handleBackdropClick"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/50" :class="backdropClass"></div>
        
        <!-- Modal Content -->
        <div class="relative bg-gray-800 rounded-xl p-6 w-full shadow-2xl" :class="sizeClass">
          <!-- Close button (optional) -->
          <button
            v-if="showClose"
            @click="close"
            class="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <!-- Icon (optional) -->
          <div v-if="icon" class="text-center mb-4">
            <div 
              class="mx-auto flex items-center justify-center w-16 h-16 rounded-full"
              :class="iconContainerClass"
            >
              <!-- Success Icon -->
              <svg v-if="icon === 'success'" class="w-8 h-8" :class="iconClass" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              
              <!-- Warning Icon -->
              <svg v-if="icon === 'warning'" class="w-8 h-8" :class="iconClass" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
              
              <!-- Error Icon -->
              <svg v-if="icon === 'error'" class="w-8 h-8" :class="iconClass" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
              
              <!-- Info Icon -->
              <svg v-if="icon === 'info'" class="w-8 h-8" :class="iconClass" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
              
              <!-- Lock Icon -->
              <svg v-if="icon === 'lock'" class="w-8 h-8" :class="iconClass" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>
          
          <!-- Title -->
          <h3 v-if="title" class="text-xl font-bold text-white mb-2" :class="{ 'text-center': centered }">
            {{ title }}
          </h3>
          
          <!-- Message/Content -->
          <div v-if="message" class="text-gray-400 mb-6" :class="{ 'text-center': centered }">
            {{ message }}
          </div>
          
          <!-- Custom content slot -->
          <div v-if="$slots.default" class="mb-6">
            <slot></slot>
          </div>
          
          <!-- Buttons -->
          <div class="flex gap-3" :class="{ 'justify-center': centered }">
            <button
              v-if="showCancel"
              @click="handleCancel"
              class="flex-1 py-2 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors cursor-pointer"
              :class="cancelButtonClass"
            >
              {{ cancelText }}
            </button>
            
            <button
              v-if="showConfirm"
              @click="handleConfirm"
              class="flex-1 py-2 px-4 rounded-lg font-medium transition-colors cursor-pointer"
              :class="confirmButtonClass"
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
  // v-model support
  modelValue: {
    type: Boolean,
    default: false
  },
  
  // Content
  title: String,
  message: String,
  
  // Icon
  icon: {
    type: String,
    validator: (value) => ['success', 'warning', 'error', 'info', 'lock'].includes(value)
  },
  
  // Buttons
  confirmText: {
    type: String,
    default: '确认'
  },
  cancelText: {
    type: String,
    default: '取消'
  },
  showConfirm: {
    type: Boolean,
    default: true
  },
  showCancel: {
    type: Boolean,
    default: true
  },
  
  // Appearance
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg', 'xl'].includes(value)
  },
  centered: {
    type: Boolean,
    default: true
  },
  showClose: {
    type: Boolean,
    default: true
  },
  closeOnBackdrop: {
    type: Boolean,
    default: true
  },
  
  // Custom classes
  confirmButtonClass: {
    type: String,
    default: 'bg-pink-600 hover:bg-pink-700 text-white'
  },
  cancelButtonClass: String,
  backdropClass: String
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel', 'close'])

// Size classes
const sizeClass = computed(() => {
  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl'
  }
  return sizes[props.size]
})

// Icon classes
const iconClass = computed(() => {
  const classes = {
    success: 'text-green-500',
    warning: 'text-yellow-500',
    error: 'text-red-500',
    info: 'text-blue-500',
    lock: 'text-red-500'
  }
  return classes[props.icon]
})

// Icon container classes
const iconContainerClass = computed(() => {
  const classes = {
    success: 'bg-green-500/20',
    warning: 'bg-yellow-500/20',
    error: 'bg-red-500/20',
    info: 'bg-blue-500/20',
    lock: 'bg-red-500/20'
  }
  return classes[props.icon]
})

// Methods
const close = () => {
  emit('update:modelValue', false)
  emit('close')
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
    close()
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