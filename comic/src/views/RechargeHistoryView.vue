<template>
  <div class="min-h-screen bg-gray-900 pb-20 sm:pb-8">
    <!-- Page Header -->
    <PageHeader title="充值记录" />
    
    <!-- Order List -->
    <div class="container mx-auto px-4 py-6 max-w-4xl">
      <!-- Loading State -->
      <div v-if="loading && !orders.length" class="flex justify-center py-20">
        <LoadingSpinner />
      </div>

      <!-- Empty State -->
      <div v-else-if="!loading && !orders.length" class="text-center py-20">
        <div class="text-gray-400">
          <svg class="w-20 h-20 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" 
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p class="text-lg mb-4">暂无充值记录</p>
        </div>
        <router-link to="/vip" class="inline-block px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors cursor-pointer">
          立即充值
        </router-link>
      </div>
        
      <!-- Orders List -->
      <div v-else class="space-y-4">
        <div 
          v-for="order in orders" 
          :key="order.id"
          class="bg-gray-800 rounded-lg p-4 border border-gray-700"
        >
          <div class="flex justify-between items-start mb-2">
            <div>
              <h3 class="text-white font-medium">{{ order.product_name }}</h3>
              <p class="text-gray-400 text-sm mt-1">订单号：{{ order.order_reference }}</p>
            </div>
            <span 
              :class="[
                'px-2 py-1 text-xs rounded font-medium',
                order.status_code === 'success' 
                  ? 'bg-green-900/50 text-green-400 border border-green-800' 
                  : order.status_code === 'pending'
                  ? 'bg-yellow-900/50 text-yellow-400 border border-yellow-800'
                  : 'bg-red-900/50 text-red-400 border border-red-800'
              ]"
            >
              {{ order.status }}
            </span>
          </div>
          
          <div class="flex justify-between items-end">
            <div class="text-sm text-gray-400">
              <p>支付方式：{{ order.payment_method }}</p>
              <p>创建时间：{{ order.created_at }}</p>
              <p v-if="order.completed_at">完成时间：{{ order.completed_at }}</p>
            </div>
            <div class="text-right">
              <span class="text-pink-500 text-xl font-bold">¥{{ order.product_price }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Pagination -->
      <div v-if="pagination && pagination.last_page > 1" class="mt-6 flex justify-center">
        <div class="flex gap-2">
          <button
            @click="changePage(pagination.current_page - 1)"
            :disabled="pagination.current_page === 1"
            class="px-3 py-1 bg-gray-800 text-gray-400 rounded border border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 cursor-pointer"
          >
            上一页
          </button>
          
          <div class="flex items-center gap-2">
            <span class="text-gray-400 text-sm">
              第 {{ pagination.current_page }} / {{ pagination.last_page }} 页
            </span>
          </div>
          
          <button
            @click="changePage(pagination.current_page + 1)"
            :disabled="pagination.current_page === pagination.last_page"
            class="px-3 py-1 bg-gray-800 text-gray-400 rounded border border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 cursor-pointer"
          >
            下一页
          </button>
        </div>
      </div>

      <!-- Load More for Mobile -->
      <div v-if="pagination && pagination.current_page < pagination.last_page && !loadingMore" 
        class="mt-6 text-center sm:hidden">
        <button
          @click="loadMore"
          class="px-6 py-2 bg-gray-800 text-gray-300 rounded-lg border border-gray-700 hover:bg-gray-700 cursor-pointer"
        >
          加载更多
        </button>
      </div>

      <!-- Loading More Indicator -->
      <div v-if="loadingMore" class="mt-6 flex justify-center">
        <LoadingSpinner size="small" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import axios from 'axios'
import PageHeader from '@/components/PageHeader.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

const router = useRouter()
const authStore = useAuthStore()

// State
const orders = ref([])
const pagination = ref(null)
const loading = ref(false)
const loadingMore = ref(false)

// API setup
const api = axios.create({
  baseURL: import.meta.env.PROD ? import.meta.env.VITE_BACKEND_API_URL : '',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  withCredentials: true
})

// Load orders
const loadOrders = async (page = 1, append = false) => {
  if (append) {
    loadingMore.value = true
  } else {
    loading.value = true
  }
  
  try {
    const response = await api.get('/api/recharge-history', {
      params: { page, per_page: 10 }
    })
    
    if (response.data.success) {
      if (append) {
        orders.value = [...orders.value, ...response.data.data]
      } else {
        orders.value = response.data.data
      }
      pagination.value = response.data.pagination
    }
  } catch (error) {
    console.error('Failed to load recharge history:', error)
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

// Change page
const changePage = (page) => {
  if (page < 1 || page > pagination.value.last_page) return
  loadOrders(page)
  window.scrollTo(0, 0)
}

// Load more for mobile
const loadMore = () => {
  if (pagination.value && pagination.value.current_page < pagination.value.last_page) {
    loadOrders(pagination.value.current_page + 1, true)
  }
}

onMounted(() => {
  // Check if user is logged in
  if (!authStore.isLoggedIn) {
    router.push({
      path: '/login',
      query: { redirect: '/recharge-history' }
    })
    return
  }
  
  loadOrders()
})
</script>