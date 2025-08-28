<template>
  <div class="min-h-screen bg-gray-900">
    <PageHeader title="更新" />
    <div class="container mx-auto px-4 py-6">
      
      <!-- Tab Navigation -->
      <div class="bg-gray-800 rounded-lg p-2 sm:p-4 mb-4">
        <!-- Type Tabs -->
        <div class="flex gap-2 mb-3">
          <button
            v-for="tab in typeTabs"
            :key="tab.value"
            @click="selectType(tab.value)"
            :class="[
              'px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-all',
              selectedType === tab.value
                ? 'bg-pink-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            ]"
          >
            {{ tab.label }}
          </button>
        </div>
        
        <!-- Weekday Tabs -->
        <div class="flex overflow-x-auto gap-1 sm:gap-2 pb-1 -mx-2 px-2 sm:mx-0 sm:px-0 no-scrollbar">
          <button
            v-for="day in weekdayTabs"
            :key="day.value"
            @click="selectDate(day.value)"
            :class="[
              'flex-shrink-0 px-2 sm:px-4 py-1 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-all whitespace-nowrap',
              selectedDate === day.value
                ? 'bg-pink-500 text-white'
                : day.value === currentWeekday
                ? 'bg-orange-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            ]"
          >
            {{ day.label }}
            <span v-if="day.value === currentWeekday" class="ml-1 text-[10px] sm:text-xs">
              (今日)
            </span>
          </button>
        </div>
      </div>
      
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center py-12">
        <LoadingSpinner />
      </div>
      
      <!-- Comics Grid -->
      <div v-else-if="comics.length > 0">
        <h2 class="text-lg sm:text-xl font-semibold text-white mb-3">
          {{ weekdayTabs.find(d => d.value === selectedDate)?.label }}更新
        </h2>
        <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-6 2xl:grid-cols-7 gap-2 sm:gap-3 md:gap-4">
          <ComicCard
            v-for="comic in comics"
            :key="comic.id"
            :comic="formatComic(comic)"
          />
        </div>
      </div>
      
      <!-- Empty State -->
      <div v-else-if="!loading" class="text-center py-12">
        <p class="text-gray-400">暂无更新</p>
      </div>
      
    </div>
  </div>
</template>

<script>
export default {
  name: 'UpdatesView'
}
</script>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { getSerialization } from '@/api/request'
import ComicCard from '@/components/ComicCard.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import PageHeader from '@/components/PageHeader.vue'

// Type tabs
const typeTabs = [
  { label: '全部', value: 'all' },
  { label: '日漫', value: 'manga' },
  { label: '韩漫', value: 'hanman' }
]

// Weekday tabs
const weekdayTabs = [
  { label: '周一', value: 1 },
  { label: '周二', value: 2 },
  { label: '周三', value: 3 },
  { label: '周四', value: 4 },
  { label: '周五', value: 5 },
  { label: '周六', value: 6 },
  { label: '周日', value: 7 },
  { label: '已完结', value: 0 }
]

// Current weekday (1-7, 0 for Sunday -> convert to 7)
const currentWeekday = computed(() => {
  const day = new Date().getDay()
  return day === 0 ? 7 : day
})

// States
const selectedType = ref('all')
const selectedDate = ref(currentWeekday.value)
const comics = ref([])
const loading = ref(false)

// Format comic data to match ComicCard expectations
const formatComic = (comic) => {
  // Handle image URL - if it's a relative path, don't set it (let ComicCard handle it)
  // If it's empty or just a path, let ComicCard use the default URL construction
  let imageUrl = null
  if (comic.image && comic.image.startsWith('/media/')) {
    // Don't set image, let ComicCard construct the URL using comic.id
    imageUrl = null
  } else if (comic.image && comic.image.startsWith('http')) {
    // Full URL provided
    imageUrl = comic.image
  }
  
  return {
    id: comic.id,
    name: comic.name,
    title: comic.name,
    author: comic.author,
    image: imageUrl, // Let ComicCard handle the image URL construction
    category: comic.category?.title || '',
    description: comic.description,
    watched: comic.liked ? 1 : 0,
    liked: comic.liked ? 1 : 0,
    tags: []
  }
}

// Load comics
const loadComics = async () => {
  if (loading.value) return
  
  loading.value = true
  comics.value = []
  
  try {
    const data = await getSerialization(
      selectedType.value,
      selectedDate.value,
      1 // Always page 1 since we load all data at once
    )
    
    if (data?.list) {
      comics.value = data.list
    }
  } catch (error) {
    console.error('Failed to load comics:', error)
  } finally {
    loading.value = false
  }
}

// Select type
const selectType = (type) => {
  selectedType.value = type
  loadComics()
}

// Select date
const selectDate = (date) => {
  selectedDate.value = date
  loadComics()
}

onMounted(() => {
  loadComics()
})
</script>

<style scoped>
/* Hide scrollbar for horizontal scroll areas on mobile */
.no-scrollbar {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}
.no-scrollbar::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}
</style>