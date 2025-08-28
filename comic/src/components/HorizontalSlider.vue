<template>
  <div class="relative group">
    <!-- Left Button -->
    <button
      v-if="showLeftButton"
      @click="scrollLeft"
      class="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-gray-800/90 rounded-full hidden md:flex items-center justify-center hover:bg-pink-500 transition-all shadow-lg cursor-pointer"
    >
      <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
    </button>
    
    <!-- Right Button -->
    <button
      v-if="showRightButton"
      @click="scrollRight"
      class="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-gray-800/90 rounded-full hidden md:flex items-center justify-center hover:bg-pink-500 transition-all shadow-lg cursor-pointer"
    >
      <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    </button>
    
    <!-- Scrollable Content -->
    <div 
      ref="scrollContainer"
      class="overflow-x-auto overflow-y-visible scrollbar-hide scroll-smooth"
      @scroll="updateScrollButtons"
    >
      <div class="flex gap-3 py-2 px-1">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const scrollContainer = ref(null)
const showLeftButton = ref(false)
const showRightButton = ref(true)

const scrollLeft = () => {
  if (scrollContainer.value) {
    const scrollAmount = scrollContainer.value.clientWidth * 0.8
    scrollContainer.value.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
  }
}

const scrollRight = () => {
  if (scrollContainer.value) {
    const scrollAmount = scrollContainer.value.clientWidth * 0.8
    scrollContainer.value.scrollBy({ left: scrollAmount, behavior: 'smooth' })
  }
}

const updateScrollButtons = () => {
  if (scrollContainer.value) {
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainer.value
    showLeftButton.value = scrollLeft > 10
    showRightButton.value = scrollLeft < scrollWidth - clientWidth - 10
  }
}

let resizeObserver = null

onMounted(() => {
  updateScrollButtons()
  
  // Watch for container size changes
  if (scrollContainer.value && window.ResizeObserver) {
    resizeObserver = new ResizeObserver(() => {
      updateScrollButtons()
    })
    resizeObserver.observe(scrollContainer.value)
  }
})

onUnmounted(() => {
  if (resizeObserver && scrollContainer.value) {
    resizeObserver.unobserve(scrollContainer.value)
    resizeObserver.disconnect()
  }
})
</script>

<style scoped>
/* Hide scrollbar for Chrome, Safari and Opera */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* Hide scrollbar for IE, Edge and Firefox */
.scrollbar-hide {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}
</style>