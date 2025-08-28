<template>
  <header class="sticky top-0 z-40 bg-gray-800 border-b border-gray-700">
    <div class="container mx-auto px-3 sm:px-4">
      <div class="flex items-center justify-between h-12 sm:h-14">
        <!-- Logo -->
        <router-link to="/" class="flex-shrink-0">
          <SiteLogo />
        </router-link>

        <!-- Desktop Navigation (Center) -->
        <nav class="hidden sm:flex items-center space-x-1 lg:space-x-3">
          <router-link
            to="/"
            class="px-3 lg:px-4 py-1.5 text-sm text-gray-300 hover:text-white transition-colors rounded-lg hover:bg-gray-700"
            :class="{ 'text-pink-500 font-bold bg-gray-700': $route.path === '/' }"
          >
            首页
          </router-link>
          <router-link
            to="/catalog"
            class="px-3 lg:px-4 py-1.5 text-sm text-gray-300 hover:text-white transition-colors rounded-lg hover:bg-gray-700"
            :class="{ 'text-pink-500 font-bold bg-gray-700': $route.path === '/catalog' }"
          >
            目录
          </router-link>
          <router-link
            to="/updates"
            class="px-3 lg:px-4 py-1.5 text-sm text-gray-300 hover:text-white transition-colors rounded-lg hover:bg-gray-700"
            :class="{ 'text-pink-500 font-bold bg-gray-700': $route.path === '/updates' }"
          >
            更新
          </router-link>
          <router-link
            to="/latest"
            class="px-3 lg:px-4 py-1.5 text-sm text-gray-300 hover:text-white transition-colors rounded-lg hover:bg-gray-700"
            :class="{ 'text-pink-500 font-bold bg-gray-700': $route.path === '/latest' }"
          >
            最新
          </router-link>
          <router-link
            to="/collection"
            class="px-3 lg:px-4 py-1.5 text-sm text-gray-300 hover:text-white transition-colors rounded-lg hover:bg-gray-700"
            :class="{ 'text-pink-500 font-bold bg-gray-700': $route.path === '/collection' }"
          >
            收藏
          </router-link>
        </nav>


        <!-- Right Section: Search and User -->
        <div class="flex items-center space-x-2">
          <!-- Search Icon Button -->
          <button
            @click="handleSearchClick"
            class="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all cursor-pointer"
            title="搜索"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          
          <!-- Settings Icon Button -->
          <button
            @click="showImageServerModal = true"
            class="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all cursor-pointer"
            title="图片服务器设置"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          
          <!-- VIP Recharge Button -->
          <router-link
            to="/vip"
            class="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white text-xs sm:text-sm font-bold rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span>充值</span>
          </router-link>
          
          <!-- Auth Section with Transition -->
          <transition name="fade" mode="out-in">
            <!-- Loading State - Skeleton -->
            <div v-if="!authStore.authInitialized" key="loading" class="flex items-center space-x-2 animate-pulse">
              <div class="w-8 h-8 bg-gray-700 rounded-full"></div>
              <div class="hidden sm:block h-4 w-16 bg-gray-700 rounded"></div>
            </div>
            
            <!-- User Profile Button -->
            <router-link
              v-else-if="authStore.isLoggedIn"
              key="user"
              to="/profile"
              class="flex items-center space-x-2 p-1.5 sm:p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-all"
            >
              <!-- User Avatar -->
              <div class="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                {{ authStore.user?.name?.charAt(0).toUpperCase() || 'U' }}
              </div>
              <span class="hidden sm:block text-sm">{{ authStore.user?.name }}</span>
            </router-link>
            
            <!-- Login/Register Buttons when not logged in -->
            <div v-else key="guest" class="flex items-center space-x-2">
              <router-link
                to="/login"
                class="px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-gray-300 hover:text-white transition-colors"
              >
                登录
              </router-link>
              <router-link
                to="/register"
                class="px-2 sm:px-3 py-1.5 text-xs sm:text-sm bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-bold transition-colors shadow-md hover:shadow-lg"
              >
                注册
              </router-link>
            </div>
          </transition>
        </div>
        
        <!-- Fullscreen Search Modal -->
        <FullscreenSearch v-model="showSearch" />
        
        <!-- Login Required Modal for Search -->
        <ModalDialog
          v-model="showLoginPrompt"
          icon="lock"
          title="需要登录"
          message="登录后即可使用搜索功能"
          confirm-text="立即登录"
          cancel-text="注册账号"
          @confirm="handleLoginConfirm"
          @cancel="handleRegister"
        />
        
        <!-- Image Server Selection Modal -->
        <ImageServerModal v-model="showImageServerModal" />
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'
import FullscreenSearch from './FullscreenSearch.vue'
import SiteLogo from './SiteLogo.vue'
import ModalDialog from './ModalDialog.vue'
import ImageServerModal from './ImageServerModal.vue'

const router = useRouter()
const authStore = useAuthStore()
const appStore = useAppStore()

const showSearch = ref(false)
const showLoginPrompt = ref(false)
const showImageServerModal = ref(false)

// Handle search click - check if user is logged in
const handleSearchClick = () => {
  if (authStore.isLoggedIn) {
    showSearch.value = true
  } else {
    showLoginPrompt.value = true
  }
}

// Handle login confirm from modal
const handleLoginConfirm = () => {
  showLoginPrompt.value = false
  router.push({
    path: '/login',
    query: { redirect: router.currentRoute.value.fullPath }
  })
}

// Handle register from modal
const handleRegister = () => {
  showLoginPrompt.value = false
  router.push({
    path: '/register',
    query: { redirect: router.currentRoute.value.fullPath }
  })
}

</script>

<style scoped>
/* Fade transition for auth state changes */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>