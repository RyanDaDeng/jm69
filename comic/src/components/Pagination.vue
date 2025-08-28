<template>
  <div v-if="totalPages > 1" class="flex items-center justify-center gap-0.5 sm:gap-1">
    <!-- Previous Page -->
    <button
      @click="changePage(currentPage - 1)"
      :disabled="currentPage === 1"
      class="p-1 sm:p-1.5 rounded transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
      :class="buttonClass"
      title="上一页"
    >
      <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
    </button>

    <!-- Page Numbers -->
    <div class="flex items-center gap-0.5">
      <!-- First page always shown if not in visible pages -->
      <button
        v-if="!visiblePages.includes(1)"
        @click="changePage(1)"
        class="min-w-[24px] h-6 sm:min-w-[28px] sm:h-7 px-1 rounded transition-all text-xs sm:text-sm cursor-pointer"
        :class="pageButtonClass(1)"
      >
        1
      </button>
      
      <!-- Left ellipsis -->
      <span v-if="showFirstEllipsis" class="px-0.5 text-gray-500 text-xs sm:text-sm">...</span>
      
      <!-- Page number buttons -->
      <button
        v-for="page in visiblePages"
        :key="page"
        @click="changePage(page)"
        class="min-w-[24px] h-6 sm:min-w-[28px] sm:h-7 px-1 rounded transition-all text-xs sm:text-sm font-medium cursor-pointer"
        :class="pageButtonClass(page)"
      >
        {{ page }}
      </button>
      
      <!-- Right ellipsis -->
      <span v-if="showLastEllipsis" class="px-0.5 text-gray-500 text-xs sm:text-sm">...</span>
      
      <!-- Last page always shown if not in visible pages -->
      <button
        v-if="!visiblePages.includes(totalPages)"
        @click="changePage(totalPages)"
        class="min-w-[24px] h-6 sm:min-w-[28px] sm:h-7 px-1 rounded transition-all text-xs sm:text-sm cursor-pointer"
        :class="pageButtonClass(totalPages)"
      >
        {{ totalPages }}
      </button>
    </div>

    <!-- Next Page -->
    <button
      @click="changePage(currentPage + 1)"
      :disabled="currentPage === totalPages"
      class="p-1 sm:p-1.5 rounded transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
      :class="buttonClass"
      title="下一页"
    >
      <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  currentPage: {
    type: Number,
    required: true
  },
  totalPages: {
    type: Number,
    required: true
  },
  maxVisible: {
    type: Number,
    default: 5 // Maximum number of page buttons to show
  },
  theme: {
    type: String,
    default: 'dark',
    validator: (value) => ['dark', 'light'].includes(value)
  }
})

const emit = defineEmits(['change'])

// Computed properties for button classes
const buttonClass = computed(() => {
  return props.theme === 'dark'
    ? 'bg-gray-800/50 hover:bg-pink-600/20 text-gray-400 hover:text-pink-400 border border-gray-700/50'
    : 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 border border-gray-300'
})

const pageButtonClass = (page) => {
  const isActive = page === props.currentPage
  if (props.theme === 'dark') {
    return isActive
      ? 'bg-gradient-to-r from-pink-600 to-pink-500 text-white shadow-lg shadow-pink-500/25 font-bold'
      : 'bg-gray-800/30 hover:bg-gray-700/50 text-gray-400 hover:text-pink-400 border border-gray-700/30'
  } else {
    return isActive
      ? 'bg-gradient-to-r from-pink-600 to-pink-500 text-white shadow-lg shadow-pink-500/25 font-bold'
      : 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 border border-gray-300'
  }
}

// Calculate visible page numbers
const visiblePages = computed(() => {
  const pages = []
  
  // If total pages is less than or equal to maxVisible + 2, show all pages
  if (props.totalPages <= props.maxVisible + 2) {
    for (let i = 1; i <= props.totalPages; i++) {
      pages.push(i)
    }
    return pages
  }
  
  const halfVisible = Math.floor(props.maxVisible / 2)
  
  let start = Math.max(1, props.currentPage - halfVisible)
  let end = Math.min(props.totalPages, props.currentPage + halfVisible)
  
  // Adjust if we're near the beginning or end
  if (props.currentPage <= halfVisible) {
    end = Math.min(props.totalPages, props.maxVisible)
  }
  if (props.currentPage > props.totalPages - halfVisible) {
    start = Math.max(1, props.totalPages - props.maxVisible + 1)
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

// Show ellipsis logic
const showFirstEllipsis = computed(() => {
  // Don't show ellipsis if we're showing all pages
  if (props.totalPages <= props.maxVisible + 2) return false
  return visiblePages.value.length > 0 && visiblePages.value[0] > 2
})

const showLastEllipsis = computed(() => {
  // Don't show ellipsis if we're showing all pages
  if (props.totalPages <= props.maxVisible + 2) return false
  return visiblePages.value.length > 0 && 
         visiblePages.value[visiblePages.value.length - 1] < props.totalPages - 1
})

// Methods
const changePage = (page) => {
  if (page < 1 || page > props.totalPages || page === props.currentPage) return
  emit('change', page)
}
</script>