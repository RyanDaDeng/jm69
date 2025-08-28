<template>
  <div class="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-gray-800 border-t border-gray-700">
    <div class="grid grid-cols-5 h-14">
      <!-- Home -->
      <router-link
        to="/"
        class="flex flex-col items-center justify-center py-1 transition-colors"
        :class="{ 'text-pink-500': $route.path === '/', 'text-gray-400 hover:text-white': $route.path !== '/' }"
      >
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
        </svg>
        <span class="text-xs mt-0.5">首页</span>
      </router-link>
      
      <!-- Catalog -->
      <router-link
        to="/catalog"
        class="flex flex-col items-center justify-center py-1 transition-colors"
        :class="{ 'text-pink-500': $route.path === '/catalog', 'text-gray-400 hover:text-white': $route.path !== '/catalog' }"
      >
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
        </svg>
        <span class="text-xs mt-0.5">目录</span>
      </router-link>
      
      <!-- Updates -->
      <router-link
        to="/updates"
        class="flex flex-col items-center justify-center py-1 transition-colors"
        :class="{ 'text-pink-500': $route.path === '/updates', 'text-gray-400 hover:text-white': $route.path !== '/updates' }"
      >
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
        </svg>
        <span class="text-xs mt-0.5">更新</span>
      </router-link>
      
      <!-- Latest -->
      <router-link
        to="/latest"
        class="flex flex-col items-center justify-center py-1 transition-colors"
        :class="{ 'text-pink-500': $route.path === '/latest', 'text-gray-400 hover:text-white': $route.path !== '/latest' }"
      >
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
        <span class="text-xs mt-0.5">最新</span>
      </router-link>
      
      <!-- Profile/My -->
      <router-link
        to="/profile"
        class="flex flex-col items-center justify-center py-1 transition-colors"
        :class="{ 'text-pink-500': $route.path === '/profile', 'text-gray-400 hover:text-white': $route.path !== '/profile' }"
      >
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
        </svg>
        <span class="text-xs mt-0.5">我的</span>
      </router-link>
    </div>
  </div>
</template>

<script setup>
</script>