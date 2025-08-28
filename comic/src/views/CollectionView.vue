<template>
  <div class="bg-gray-900 min-h-screen">
    <PageHeader title="我的收藏" />
    <div class="container mx-auto px-4 py-6">
      <div class="mb-6">
        <p class="text-gray-400 mt-1">共 {{ totalCollections }} 部作品</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center py-20">
        <LoadingSpinner />
      </div>

      <div v-else-if="!collections.length" class="text-center py-12">
        <svg class="w-24 h-24 text-gray-600 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
        </svg>
        <p class="text-gray-400 mb-4">还没有收藏任何漫画</p>
        <router-link
          to="/latest"
          class="inline-block px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
        >
          去看看最新漫画
        </router-link>
      </div>

      <div v-else>
        <!-- Collection Grid -->
        <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-6 gap-3">
          <div
            v-for="comic in collections"
            :key="comic.id || comic.comic_id"
            class="relative group"
          >
            <ComicCard :comic="comic" :show-collection-date="true" />
            
            <!-- Remove Button -->
            <button
              @click.prevent="removeFromCollectionHandler(comic)"
              class="absolute top-2 right-2 p-1.5 bg-red-500/90 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600 z-10"
              title="移除收藏"
            >
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <!-- Pagination -->
        <div class="mt-8">
          <Pagination
            :current-page="currentPage"
            :total-pages="totalPages"
            @change="handlePageChange"
          />
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onActivated } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { getCollections, removeFromCollection } from '@/api/collection'
import ComicCard from '@/components/ComicCard.vue'
import Pagination from '@/components/Pagination.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import PageHeader from '@/components/PageHeader.vue'

const router = useRouter()
const appStore = useAppStore()

// Data
const collections = ref([])
const loading = ref(false)
const currentPage = ref(1)
const totalPages = ref(1)
const totalCollections = ref(0)
const perPage = 24

// Methods
const loadCollections = async (page = 1) => {
  loading.value = true
  try {
    const response = await getCollections(page, perPage)
    // Map comic_id to id for ComicCard component
    collections.value = (response.data || []).map(item => ({
      ...item,
      id: item.comic_id || item.id,
      title: item.name || item.title
    }))
    currentPage.value = response.current_page || 1
    totalPages.value = response.last_page || 1
    totalCollections.value = response.total || 0
    
    // Update app store for first page
    if (page === 1) {
      appStore.collectedComics = collections.value
    }
  } catch (error) {
    console.error('Failed to load collections:', error)
  } finally {
    loading.value = false
  }
}

const removeFromCollectionHandler = async (comic) => {
  if (!confirm(`确定要移除《${comic.name}》吗？`)) return
  
  try {
    await removeFromCollection(comic.comic_id || comic.id)
    
    // Remove from local list
    const index = collections.value.findIndex(c => (c.comic_id || c.id) === (comic.comic_id || comic.id))
    if (index > -1) {
      collections.value.splice(index, 1)
      totalCollections.value--
    }
    
    // Update app store
    const storeIndex = appStore.collectedComics.findIndex(c => (c.comic_id || c.id) === (comic.comic_id || comic.id))
    if (storeIndex > -1) {
      appStore.collectedComics.splice(storeIndex, 1)
    }
  } catch (error) {
    console.error('Failed to remove collection:', error)
    alert('取消收藏失败，请重试')
  }
}

const handlePageChange = (page) => {
  loadCollections(page)
  window.scrollTo(0, 0)
}


const checkLoginAndLoad = () => {
  // Check if user is logged in
  if (!appStore.isLoggedIn) {
    router.push({
      path: '/login',
      query: { redirect: '/collection' }
    })
    return
  }
  
  // Always reload collections when entering the page
  loadCollections()
}

onMounted(() => {
  checkLoginAndLoad()
})

// Reload collections when navigating back to this view (if using keep-alive)
onActivated(() => {
  checkLoginAndLoad()
})
</script>