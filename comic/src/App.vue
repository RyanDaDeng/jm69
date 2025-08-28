<template>
  <div id="app" class="min-h-screen flex flex-col">
    <AppHeader v-if="!isChapterView" />
    <main class="flex-grow pb-14 sm:pb-0">
      <router-view v-slot="{ Component, route }">
        <keep-alive :include="cachedViews">
          <component :is="Component" :key="route.path" />
        </keep-alive>
      </router-view>
    </main>
    <AppFooter v-if="!isChapterView" />
    <MobileBottomNav v-if="!isChapterView" />
    <BackToTop />
    <AgeWarning />
    <ToastNotification />
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import MobileBottomNav from '@/components/MobileBottomNav.vue'
import BackToTop from '@/components/BackToTop.vue'
import AgeWarning from '@/components/AgeWarning.vue'
import ToastNotification from '@/components/ToastNotification.vue'

const route = useRoute()
const appStore = useAppStore()
const authStore = useAuthStore()

const isChapterView = computed(() => false) // Always show header and nav

// Define which views should be cached
const cachedViews = [
  'HomeView',
  'CatalogView', 
  'UpdatesView',
  'LatestView',
  'CollectionView',
  'SearchView'
]

onMounted(async () => {
  // 初始化应用
  appStore.initializeApp()
  
  // 初始化认证状态（页面刷新时恢复登录状态）
  await authStore.initAuth()
})
</script>

<style>
@import './app.css';
</style>
