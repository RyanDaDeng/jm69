<template>
  <div class="flex items-center justify-center space-x-2 py-8">
    <!-- First Page -->
    <button
      @click="goToPage(1)"
      :disabled="currentPage === 1"
      class="px-3 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      aria-label="第一页"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
      </svg>
    </button>

    <!-- Previous Page -->
    <button
      @click="goToPage(currentPage - 1)"
      :disabled="currentPage === 1"
      class="px-3 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      aria-label="上一页"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
    </button>

    <!-- Page Numbers -->
    <div class="hidden sm:flex items-center space-x-1">
      <!-- First page -->
      <button
        v-if="showFirstPage"
        @click="goToPage(1)"
        class="px-3 py-2 rounded-lg transition-colors"
        :class="currentPage === 1 ? 'bg-pink-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'"
      >
        1
      </button>
      
      <!-- Left ellipsis -->
      <span v-if="showLeftEllipsis" class="px-2 text-gray-500">...</span>
      
      <!-- Visible page numbers -->
      <button
        v-for="page in visiblePages"
        :key="page"
        @click="goToPage(page)"
        class="px-3 py-2 rounded-lg transition-colors"
        :class="currentPage === page ? 'bg-pink-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'"
      >
        {{ page }}
      </button>
      
      <!-- Right ellipsis -->
      <span v-if="showRightEllipsis" class="px-2 text-gray-500">...</span>
      
      <!-- Last page -->
      <button
        v-if="showLastPage"
        @click="goToPage(totalPages)"
        class="px-3 py-2 rounded-lg transition-colors"
        :class="currentPage === totalPages ? 'bg-pink-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'"
      >
        {{ totalPages }}
      </button>
    </div>

    <!-- Mobile Page Info -->
    <div class="sm:hidden flex items-center px-3 py-2 bg-gray-800 text-white rounded-lg">
      <span>{{ currentPage }} / {{ totalPages }}</span>
    </div>

    <!-- Next Page -->
    <button
      @click="goToPage(currentPage + 1)"
      :disabled="currentPage === totalPages"
      class="px-3 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      aria-label="下一页"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    </button>

    <!-- Last Page -->
    <button
      @click="goToPage(totalPages)"
      :disabled="currentPage === totalPages"
      class="px-3 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      aria-label="最后一页"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
      </svg>
    </button>

    <!-- Jump to Page (Desktop) -->
    <div class="hidden md:flex items-center ml-4 space-x-2">
      <span class="text-gray-400 text-sm">跳转到</span>
      <input
        v-model.number="jumpToPageInput"
        @keyup.enter="jumpToPage"
        type="number"
        :min="1"
        :max="totalPages"
        class="w-16 px-2 py-1 bg-gray-800 border border-gray-700 text-white rounded focus:outline-none focus:border-pink-500"
      />
      <button
        @click="jumpToPage"
        class="px-3 py-1 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors text-sm"
      >
        确定
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  currentPage: {
    type: Number,
    required: true
  },
  totalPages: {
    type: Number,
    required: true
  },
  // Maximum number of page buttons to show (excluding first/last)
  maxVisible: {
    type: Number,
    default: 5
  }
})

const emit = defineEmits(['update:currentPage', 'change'])

// Jump to page input
const jumpToPageInput = ref(props.currentPage)

// Watch current page changes to update jump input
watch(() => props.currentPage, (newPage) => {
  jumpToPageInput.value = newPage
})

// Computed properties for pagination display
const visiblePages = computed(() => {
  const pages = []
  const maxVisible = props.maxVisible
  const total = props.totalPages
  const current = props.currentPage
  
  if (total <= maxVisible + 2) {
    // Show all pages if total is small
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
    return pages
  }
  
  // Calculate start and end of visible pages
  let start = Math.max(2, current - Math.floor(maxVisible / 2))
  let end = Math.min(total - 1, start + maxVisible - 1)
  
  // Adjust start if we're near the end
  if (end === total - 1) {
    start = Math.max(2, end - maxVisible + 1)
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

const showFirstPage = computed(() => {
  if (props.totalPages <= props.maxVisible + 2) return false
  return !visiblePages.value.includes(1)
})

const showLastPage = computed(() => {
  if (props.totalPages <= props.maxVisible + 2) return false
  return !visiblePages.value.includes(props.totalPages)
})

const showLeftEllipsis = computed(() => {
  if (props.totalPages <= props.maxVisible + 2) return false
  return visiblePages.value[0] > 2
})

const showRightEllipsis = computed(() => {
  if (props.totalPages <= props.maxVisible + 2) return false
  return visiblePages.value[visiblePages.value.length - 1] < props.totalPages - 1
})

// Methods
const goToPage = (page) => {
  if (page < 1 || page > props.totalPages || page === props.currentPage) return
  
  emit('update:currentPage', page)
  emit('change', page)
}

const jumpToPage = () => {
  const page = parseInt(jumpToPageInput.value)
  if (!isNaN(page) && page >= 1 && page <= props.totalPages) {
    goToPage(page)
  } else {
    // Reset to current page if invalid
    jumpToPageInput.value = props.currentPage
  }
}
</script>