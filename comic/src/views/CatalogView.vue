<template>
  <div class="min-h-screen bg-gray-900">
    <PageHeader title="分类浏览" />
    <!-- Filter Bar Container -->
    <div class="container mx-auto px-4 py-6">

      <!-- Loading Categories -->
      <div v-if="loadingCategories" class="bg-gray-800 rounded-lg p-4">
        <div class="flex flex-col items-center">
          <LoadingSpinner />
          <span class="mt-3 text-gray-400 text-sm">加载分类中...</span>
        </div>
      </div>

      <!-- Filter Bar -->
      <div v-if="categories.length > 0" class="bg-gray-800 rounded-lg p-2 sm:p-4 space-y-2 sm:space-y-4">
        <!-- Category Selection -->
        <div>
          <label class="text-xs sm:text-sm text-gray-400 mb-1 sm:mb-2 block">分类</label>
          <div class="flex overflow-x-auto gap-1 sm:gap-2 pb-1 sm:pb-0 -mx-2 px-2 sm:mx-0 sm:px-0 sm:flex-wrap no-scrollbar">
            <button
              v-for="category in categories"
              :key="category.id"
              @click="selectCategory(category)"
              :class="[
                'flex-shrink-0 px-2 sm:px-4 py-1 sm:py-2 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap',
                selectedCategory?.id === category.id
                  ? 'bg-pink-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              ]"
            >
              {{ category.name }}
              <span v-if="category.total_albums > 0" class="hidden sm:inline ml-1 text-xs opacity-70">
                ({{ formatNumber(category.total_albums) }})
              </span>
            </button>
          </div>
        </div>

          <!-- Sort Options -->
          <div>
            <label class="text-xs sm:text-sm text-gray-400 mb-1 sm:mb-2 block">排序</label>
            <div class="flex overflow-x-auto gap-1 sm:gap-2 pb-1 sm:pb-0 -mx-2 px-2 sm:mx-0 sm:px-0 sm:flex-wrap no-scrollbar">
              <button
                v-for="sort in sortOptions"
                :key="sort.value"
                @click="selectSort(sort.value)"
                :class="[
                  'flex-shrink-0 px-2 sm:px-4 py-1 sm:py-2 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap',
                  selectedSort === sort.value
                    ? 'bg-pink-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                ]"
              >
                {{ sort.label }}
              </button>
            </div>
          </div>

          <!-- Sub Categories (hide for 最新A漫) -->
          <div v-if="selectedCategory?.sub_categories?.length && selectedCategory.id !== 0">
            <label class="text-xs sm:text-sm text-gray-400 mb-1 sm:mb-2 block">子分类</label>
            <div class="flex overflow-x-auto gap-1 sm:gap-2 pb-1 sm:pb-0 -mx-2 px-2 sm:mx-0 sm:px-0 sm:flex-wrap no-scrollbar">
              <button
                @click="selectSubCategory(null)"
                :class="[
                  'flex-shrink-0 px-2 sm:px-4 py-1 sm:py-2 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap',
                  !selectedSubCategory
                    ? 'bg-pink-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                ]"
              >
                全部
              </button>
              <button
                v-for="sub in selectedCategory.sub_categories"
                :key="sub.CID"
                @click="selectSubCategory(sub)"
                :class="[
                  'flex-shrink-0 px-2 sm:px-4 py-1 sm:py-2 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap',
                  selectedSubCategory?.CID === sub.CID
                    ? 'bg-pink-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                ]"
              >
                {{ sub.name }}
              </button>
            </div>
          </div>
      </div>

      <!-- Top Pagination -->
      <div v-if="hasSearched && totalPages > 1 && comics.length > 0" class="mt-4 mb-4">
        <Pagination
          :current-page="displayPage"
          :total-pages="totalPages"
          @change="handlePageChange"
        />
      </div>

      <!-- Theme Tags Section (only show when no category selected or showing default) -->
      <div v-if="!hasSearched" class="bg-gray-800 rounded-lg p-3 sm:p-4 mt-2 sm:mt-4 mb-4 sm:mb-6">
        <div
          v-for="block in themeBlocks"
          :key="block.title"
          class="mb-3 sm:mb-4 last:mb-0"
        >
          <h3 class="text-xs sm:text-sm text-gray-400 mb-1.5 sm:mb-2">{{ block.title }}</h3>
          <div class="flex flex-wrap gap-1.5 sm:gap-2">
            <button
              v-for="tag in block.content"
              :key="tag"
              @click="searchTag(tag)"
              class="px-2 sm:px-3 py-1 sm:py-1.5 bg-gray-700 hover:bg-pink-500 text-gray-300 hover:text-white rounded-full text-xs sm:text-sm transition-all"
            >
              {{ tag }}
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center py-8 sm:py-12">
        <LoadingSpinner />
      </div>

      <!-- Comics Grid -->
      <div v-if="!loading && comics.length > 0" class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-6 2xl:grid-cols-7 gap-2 sm:gap-3 md:gap-4 mt-4">
        <ComicCard
          v-for="comic in comics"
          :key="comic.id"
          :comic="comic"
        />
      </div>

      <!-- Empty State -->
      <div v-if="!loading && hasSearched && comics.length === 0" class="text-center py-8 sm:py-12">
        <p class="text-gray-400 text-sm">暂无相关漫画</p>
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
      
      <!-- Pagination -->
      <div v-if="hasSearched && totalPages > 1 && comics.length > 0" class="mt-8">
        <Pagination
          :current-page="displayPage"
          :total-pages="totalPages"
          @change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CatalogView'
}
</script>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getCategoriesFilter, getCategories } from '@/api/request'
import ComicCard from '@/components/ComicCard.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import Pagination from '@/components/Pagination.vue'
import { formatNumber } from '@/utils/format'
import PageHeader from '@/components/PageHeader.vue'

const router = useRouter()

// Categories data
const categories = ref([])
const themeBlocks = ref([])

// Filter states
const selectedCategory = ref(null)
const selectedSubCategory = ref(null)
const selectedSort = ref('mv') // Default to 总排名

// Sort options
const sortOptions = [
  { label: '最新', value: '' },
  { label: '最多爱心', value: 'tf' },
  { label: '总排名', value: 'mv' },
  { label: '月排名', value: 'mv_m' },
  { label: '周排名', value: 'mp_w' }
]

// Comics data
const comics = ref([])
const loading = ref(false)
const loadingCategories = ref(true)
const loadingMore = ref(false) // Separate loading state for load more
const currentPage = ref(1)
const hasMore = ref(true)
const hasSearched = ref(false)

// Pagination data
const totalItems = ref(0)
const itemsPerPage = ref(0)
const totalPages = ref(1)
const displayPage = ref(1) // For pagination display

// Load categories
const loadCategories = async () => {
  loadingCategories.value = true
  try {
    const data = await getCategories()
    
    if (data) {
      categories.value = data.categories || []
      themeBlocks.value = data.blocks || []

      // Select first category (最新A漫) by default and load
      if (categories.value.length > 0) {
        selectedCategory.value = categories.value[0]
        applyFilter() // Load with default settings
      }
    }
  } catch (error) {
    console.error('Failed to load categories:', error)
  } finally {
    loadingCategories.value = false
  }
}

// Load comics
const loadComics = async (reset = false) => {
  if ((reset && loading.value) || (!reset && loadingMore.value) || (!hasMore.value && !reset)) return

  // Use different loading states for reset vs append
  if (reset) {
    loading.value = true
  } else {
    loadingMore.value = true
  }

  try {
    // Build category parameter
    let categoryParam = selectedCategory.value?.slug || ''
    if (selectedSubCategory.value && categoryParam) {
      categoryParam = `${categoryParam}_${selectedSubCategory.value.slug}`
    }

    const data = await getCategoriesFilter(
      currentPage.value,
      selectedSort.value,
      categoryParam
    )

    if (data?.content) {
      if (reset) {
        comics.value = data.content
      } else {
        comics.value.push(...data.content)
      }

      // Set pagination data from response
      if (data.total !== undefined) {
        totalItems.value = data.total
      }
      
      // Calculate items per page from first page response
      if (itemsPerPage.value === 0 && data.content.length > 0) {
        itemsPerPage.value = data.content.length
      }
      
      // Calculate total pages
      if (totalItems.value > 0 && itemsPerPage.value > 0) {
        totalPages.value = Math.ceil(totalItems.value / itemsPerPage.value)
      } else {
        // If no total in response, estimate based on content length
        totalPages.value = currentPage.value + (data.content.length >= 80 ? 1 : 0)
      }

      // Update display page for pagination component
      displayPage.value = currentPage.value
      
      currentPage.value++
      hasMore.value = data.content.length >= 80
    } else {
      hasMore.value = false
      if (reset) {
        totalPages.value = 0
      }
    }
  } catch (error) {
    console.error('Failed to load comics:', error)
    hasMore.value = false
  } finally {
    if (reset) {
      loading.value = false
    } else {
      loadingMore.value = false
    }
  }
}

// Apply filter immediately
const applyFilter = () => {
  comics.value = []
  currentPage.value = 1
  displayPage.value = 1
  hasMore.value = true
  hasSearched.value = true
  totalItems.value = 0
  itemsPerPage.value = 0
  totalPages.value = 1
  loadComics(true)
}

// Search tag
const searchTag = (tag) => {
  router.push({
    path: '/search',
    query: { q: tag }
  })
}

// Select category
const selectCategory = (category) => {
  selectedCategory.value = category
  selectedSubCategory.value = null
  applyFilter()
}

// Select sort
const selectSort = (sort) => {
  selectedSort.value = sort
  applyFilter()
}

// Select sub category
const selectSubCategory = (subCategory) => {
  selectedSubCategory.value = subCategory
  applyFilter()
}

// Handle pagination
const handlePageChange = (page) => {
  // Reset for new page
  comics.value = []
  currentPage.value = page
  displayPage.value = page
  hasMore.value = true
  loadComics(true)
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  loadCategories()
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
