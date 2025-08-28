<template>
  <div class="sticky top-0 sm:top-14 z-50 sm:z-30 bg-gray-800 shadow-lg">
    <div class="container mx-auto px-4">
      <div class="flex items-center justify-between h-14">
        <!-- Back Button -->
        <button
          @click="handleBack"
          class="flex items-center space-x-1 sm:space-x-2 text-white hover:text-pink-400 transition-colors flex-shrink-0 cursor-pointer"
        >
          <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          <span class="text-sm sm:text-base">{{ backText }}</span>
        </button>
        
        <!-- Title -->
        <h1 class="text-white font-semibold text-sm sm:text-lg truncate px-2 flex-1 text-center">
          {{ title }}
        </h1>
        
        <!-- Right Action Slot or Placeholder -->
        <div class="flex-shrink-0" :class="$slots.action ? '' : 'w-12 sm:w-14'">
          <slot name="action"></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  backText: {
    type: String,
    default: '返回'
  },
  backTo: {
    type: String,
    default: null
  }
})

const router = useRouter()

const handleBack = () => {
  if (props.backTo) {
    router.push(props.backTo)
  } else {
    router.back()
  }
}
</script>