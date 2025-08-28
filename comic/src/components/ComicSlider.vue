<template>
  <div class="comic-slider mb-8">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-bold text-gray-800">{{ promotion.title }}</h2>
      <button
        @click="scrollNext"
        class="flex items-center text-pink-500 hover:text-pink-600 transition-colors"
      >
        <span class="mr-1">右滑看更多</span>
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
    
    <div class="relative overflow-hidden">
      <div
        ref="sliderContent"
        class="flex transition-transform duration-300 ease-out gap-4"
        :style="{ transform: `translateX(-${currentPosition * 300}px)` }"
      >
        <div
          v-for="comic in promotion.content"
          :key="comic.id"
          class="flex-shrink-0 w-72 cursor-pointer hover:opacity-90 transition-opacity"
          @click="goToChapter(comic.id)"
        >
          <div class="bg-white rounded-lg shadow-md overflow-hidden">
            <div class="relative aspect-[3/4] bg-gray-200">
              <img
                :src="getAlbumCover(comic.id)"
                :alt="comic.name"
                class="w-full h-full object-cover"
                loading="lazy"
                @error="handleImageError"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity">
                <div class="absolute bottom-2 left-2 right-2">
                  <p class="text-white text-sm font-semibold line-clamp-2">{{ comic.name }}</p>
                </div>
              </div>
            </div>
            <div class="p-3">
              <h3 class="text-sm font-semibold text-gray-900 truncate">{{ comic.name }}</h3>
              <p class="text-xs text-gray-500 mt-1 truncate">{{ comic.author || '未知作者' }}</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Progress Bar -->
      <div class="mt-4 h-1 bg-gray-200 rounded-full overflow-hidden">
        <div
          class="h-full bg-pink-500 rounded-full transition-all duration-300"
          :style="{
            width: `${(1 / maxPosition) * 100}%`,
            marginLeft: `${(currentPosition / maxPosition) * (100 - (1 / maxPosition) * 100)}%`
          }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { getImageServer } from '@/utils/imageServer'

const props = defineProps({
  promotion: {
    type: Object,
    required: true
  }
})

const router = useRouter()
const appStore = useAppStore()

const sliderContent = ref(null)
const currentPosition = ref(0)

const maxPosition = computed(() => {
  const itemCount = props.promotion.content?.length || 0
  return Math.max(0, itemCount - 4) // Show 4 items at once
})

const getAlbumCover = (comicId) => {
  const server = getImageServer()
  return `${server}/media/albums/${comicId}_3x4.jpg`
}

const scrollNext = () => {
  if (currentPosition.value < maxPosition.value) {
    currentPosition.value++
  } else {
    currentPosition.value = 0 // Loop back to start
  }
}

const goToChapter = (comicId) => {
  router.push(`/chapter/${comicId}`)
}

const handleImageError = (e) => {
  e.target.src = '/default.jpeg'
}
</script>