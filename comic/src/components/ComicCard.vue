<template>
  <router-link
    :to="`/chapter/${comic.id}`"
    class="block bg-gray-800 rounded-lg overflow-hidden hover:ring-2 hover:ring-pink-500 transition-all group"
  >
    <div class="relative aspect-[3/4] bg-gray-700">
      <img
        :src="getComicImage()"
        :alt="comic.name"
        class="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
        loading="lazy"
        @error="handleImageError"
      />
      <div v-if="comic.category" class="absolute top-1 left-1 sm:top-2 sm:left-2">
        <span class="px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs text-white bg-pink-500/80 backdrop-blur rounded-full">
          {{ typeof comic.category === 'object' ? (comic.category.title || comic.category.name || '') : comic.category }}
        </span>
      </div>
      <div v-if="comic.watched" class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-1 sm:p-2">
        <div class="flex items-center justify-between text-white text-[10px] sm:text-xs">
          <span class="flex items-center gap-0.5 sm:gap-1">
            <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
            </svg>
            {{ formatNumber(comic.watched) }}
          </span>
          <span v-if="comic.liked" class="flex items-center gap-0.5 sm:gap-1">
            <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
            </svg>
            {{ formatNumber(comic.liked) }}
          </span>
        </div>
      </div>
    </div>
    <div class="p-1.5 sm:p-2">
      <h3 class="text-[10px] sm:text-xs font-semibold text-white truncate">
        {{ comic.name || comic.title || 'Unknown' }}
      </h3>
      <p v-if="showCollectionDate && comic.created_at" class="text-[10px] sm:text-xs text-gray-400 mt-0.5 truncate">
        收藏于 {{ formatDate(comic.created_at) }}
      </p>
      <p v-else-if="comic.author || comic.authors" class="text-[10px] sm:text-xs text-gray-400 mt-0.5 truncate">
        {{ comic.author || (Array.isArray(comic.authors) ? comic.authors.join(', ') : comic.authors) || '' }}
      </p>
      <div v-if="comic.description && typeof comic.description === 'string'" class="hidden sm:block text-xs text-gray-500 mt-1 line-clamp-2">
        {{ comic.description }}
      </div>
      <div v-if="comic.tags && comic.tags.length" class="hidden sm:flex flex-wrap gap-1 mt-1">
        <span
          v-for="tag in comic.tags.slice(0, 2)"
          :key="tag"
          class="px-1.5 py-0.5 text-xs bg-gray-700 text-gray-300 rounded"
        >
          {{ tag }}
        </span>
      </div>
    </div>
  </router-link>
</template>

<script setup>
import { useAppStore } from '@/stores/app'
import { formatNumber } from '@/utils/format'
import { getImageServer } from '@/utils/imageServer'

const appStore = useAppStore()

const props = defineProps({
  comic: {
    type: Object,
    required: true
  },
  showCollectionDate: {
    type: Boolean,
    default: false
  }
})

const getComicImage = () => {
  // If image URL is provided directly, use it
  if (props.comic.image) {
    return props.comic.image
  }
  // Otherwise, construct the standard album cover URL
  const server = getImageServer()
  return `${server}/media/albums/${props.comic.id}_3x4.jpg`
}

const handleImageError = (e) => {
  e.target.src = '/default.jpeg'
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMs = now - date
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
  
  if (diffInDays === 0) {
    return '今天'
  } else if (diffInDays === 1) {
    return '昨天'
  } else if (diffInDays < 7) {
    return `${diffInDays}天前`
  } else if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7)
    return `${weeks}周前`
  } else if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30)
    return `${months}个月前`
  } else {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  }
}
</script>