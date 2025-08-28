<template>
  <Teleport to="body">
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[100] flex items-start justify-center pt-[5vh] sm:pt-[10vh] bg-black/80 backdrop-blur-sm"
        @click.self="close"
      >
        <div 
          class="w-full max-w-2xl mx-2 sm:mx-4"
          @click.stop
        >
          <!-- Search Input -->
          <div class="relative">
            <input
              ref="searchInput"
              v-model="searchQuery"
              @keyup.enter="handleSearch"
              @keyup.esc="close"
              type="text"
              placeholder="搜索漫画..."
              class="w-full px-4 sm:px-6 py-3 sm:py-4 pl-11 sm:pl-14 text-base sm:text-lg text-white bg-gray-800/95 rounded-xl sm:rounded-2xl shadow-2xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 border border-gray-700"
            />
            <svg
              class="absolute left-3 sm:left-5 top-3.5 sm:top-5 w-5 sm:w-6 h-5 sm:h-6 text-gray-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
            </svg>
            
            <!-- Close button -->
            <button
              @click="close"
              class="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <svg class="w-5 sm:w-6 h-5 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Search Suggestions -->
          <div class="mt-3 sm:mt-4 bg-gray-800/95 rounded-xl sm:rounded-2xl shadow-2xl border border-gray-700 overflow-hidden max-h-[70vh] overflow-y-auto">
            <!-- Search History -->
            <div v-if="appStore.searchHistory.length > 0" class="p-3 sm:p-4 border-b border-gray-700">
              <div class="flex items-center justify-between mb-2 sm:mb-3">
                <h3 class="text-xs sm:text-sm text-gray-400 font-medium">搜索历史</h3>
                <button
                  @click="clearHistory"
                  class="text-xs text-gray-500 hover:text-red-400 transition-colors cursor-pointer"
                >
                  清空
                </button>
              </div>
              <div class="space-y-1">
                <button
                  v-for="(query, index) in appStore.searchHistory.slice(0, 8)"
                  :key="index"
                  @click="selectHistory(query)"
                  class="w-full text-left px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-300 hover:bg-gray-700/50 rounded-lg transition-colors flex items-center justify-between group cursor-pointer"
                >
                  <div class="flex items-center space-x-2 sm:space-x-3">
                    <svg class="w-3.5 sm:w-4 h-3.5 sm:h-4 text-gray-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
                    </svg>
                    <span class="truncate">{{ query }}</span>
                  </div>
                  <svg
                    @click.stop="removeHistory(query)"
                    class="w-4 h-4 text-gray-600 hover:text-red-400 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Hot Tags -->
            <div v-if="hotTags.length > 0" class="p-3 sm:p-4">
              <h3 class="text-xs sm:text-sm text-gray-400 mb-2 sm:mb-3 font-medium">热门标签</h3>
              <div class="flex flex-wrap gap-1.5 sm:gap-2">
                <button
                  v-for="tag in hotTags.slice(0, 20)"
                  :key="tag"
                  @click="searchTag(tag)"
                  class="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-pink-600/20 border border-pink-500/30 rounded-full text-xs sm:text-sm text-pink-400 hover:bg-pink-500 hover:text-white hover:border-pink-500 transition-all cursor-pointer"
                >
                  {{ tag }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, nextTick, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { getHotTags } from '@/api/request'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const router = useRouter()
const appStore = useAppStore()

const searchQuery = ref('')
const searchInput = ref(null)
const hotTags = ref([])

const close = () => {
  searchQuery.value = ''
  emit('update:modelValue', false)
}

const handleSearch = () => {
  const query = searchQuery.value.trim()
  if (query) {
    if (Number.isInteger(+query) && +query >= 10) {
      router.push(`/chapter/${query}`)
    } else {
      appStore.addSearchHistory(query)
      router.push({
        path: '/search',
        query: { wd: query }
      })
    }
    close()
  }
}

const selectHistory = (query) => {
  searchQuery.value = query
  handleSearch()
}

const searchTag = (tag) => {
  router.push({
    path: '/search',
    query: { q: tag }
  })
  close()
}

const clearHistory = () => {
  appStore.clearSearchHistory()
}

const removeHistory = (query) => {
  const index = appStore.searchHistory.indexOf(query)
  if (index > -1) {
    appStore.searchHistory.splice(index, 1)
    localStorage.setItem('searchHistory', JSON.stringify(appStore.searchHistory))
  }
}

// Load hot tags
const loadHotTags = async () => {
  try {
    const tags = await getHotTags()
    hotTags.value = tags || []
  } catch (error) {
    console.error('Failed to load hot tags:', error)
  }
}

// Focus input when opened and load hot tags when first opened
watch(() => props.modelValue, async (newValue) => {
  if (newValue) {
    await nextTick()
    searchInput.value?.focus()
    // Load hot tags when search is opened for the first time
    if (hotTags.value.length === 0) {
      loadHotTags()
    }
  }
})

// Listen for ESC key globally
const handleEscape = (e) => {
  if (e.key === 'Escape' && props.modelValue) {
    close()
  }
}

onMounted(() => {
  // Don't load hot tags on mount, wait until search is opened
  document.addEventListener('keyup', handleEscape)
  return () => {
    document.removeEventListener('keyup', handleEscape)
  }
})
</script>