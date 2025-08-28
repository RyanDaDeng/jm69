<template>
  <div class="bg-gray-900 min-h-screen">
    <PageHeader title="最新更新" />
    <div class="container mx-auto px-4 py-6">
      
      <div v-if="!comics.length && !loading" class="text-center py-12">
        <p class="text-gray-400">暂无内容</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center py-8 sm:py-12">
        <LoadingSpinner />
      </div>

      <div v-if="!loading" class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-6 gap-3">
        <ComicCard
          v-for="comic in comics"
          :key="`${comic.id}-${comic.page}`"
          :comic="comic"
        />
      </div>

      <!-- Load More Button -->
      <div
        v-if="hasMore && !loading && !loadingMore && comics.length"
        class="flex justify-center py-6 sm:py-8"
      >
        <button
          @click="loadComics()"
          class="px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-medium transition-colors cursor-pointer"
        >
          加载更多
        </button>
      </div>

      <!-- Loading More Indicator -->
      <div v-if="loadingMore" class="flex justify-center py-6 sm:py-8">
        <LoadingSpinner />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LatestView'
}
</script>

<script setup>
import { ref, onMounted } from 'vue'
import { getLatestContent } from '@/api/request'
import ComicCard from '@/components/ComicCard.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import PageHeader from '@/components/PageHeader.vue'

const comics = ref([])
const loading = ref(false)
const loadingMore = ref(false)
const currentPage = ref(1)
const hasMore = ref(true)

// Load comics
const loadComics = async (reset = false) => {
  if ((reset && loading.value) || (!reset && loadingMore.value) || (!hasMore.value && !reset)) return

  // Use different loading states for reset vs append
  if (reset) {
    loading.value = true
    currentPage.value = 1
    comics.value = []
    hasMore.value = true
  } else {
    loadingMore.value = true
  }
  
  try {
    const data = await getLatestContent(currentPage.value)
    
    if (!data || data.length === 0) {
      hasMore.value = false
    } else {
      // Add page info to avoid duplicate keys
      const comicsWithPage = data.map(comic => ({
        ...comic,
        page: currentPage.value
      }))
      
      comics.value.push(...comicsWithPage)
      currentPage.value++
      hasMore.value = data.length >= 80 // Assuming 80 items per page
    }
  } catch (error) {
    console.error('Failed to load latest comics:', error)
    hasMore.value = false
  } finally {
    if (reset) {
      loading.value = false
    } else {
      loadingMore.value = false
    }
  }
}

onMounted(() => {
  loadComics(true)
})
</script>