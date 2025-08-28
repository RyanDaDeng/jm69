<template>
  <div class="min-h-screen bg-gray-900">
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center min-h-screen">
      <div class="flex flex-col items-center">
        <LoadingSpinner />
      </div>
    </div>

    <!-- Main Content (always visible) -->
    <div v-else-if="!isReading">
      <!-- Page Header -->
      <PageHeader :title="comicInfo.name || '加载中...'">
        <template #action>
          <button
            @click="toggleCollect"
            class="p-2 rounded-lg hover:bg-gray-700 transition-colors"
            :class="isCollected ? 'text-pink-500' : 'text-gray-400'"
          >
            <svg class="w-5 h-5 sm:w-6 sm:h-6" :fill="isCollected ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </template>
      </PageHeader>

      <!-- Comic Info Section -->
      <div class="relative">
        <!-- Background blur -->
        <div 
          v-if="comicInfo.id"
          class="absolute inset-0 h-96 bg-cover bg-center blur-xl opacity-30"
          :style="{ backgroundImage: `url(${getAlbumCover(comicInfo.id)})` }"
        ></div>
        
        <!-- Comic details -->
        <div class="relative container mx-auto px-4 py-8">
          <div class="flex flex-col md:flex-row gap-6">
            <!-- Cover Image -->
            <div class="w-32 sm:w-48 h-44 sm:h-64 flex-shrink-0 mx-auto md:mx-0">
              <img 
                v-if="comicInfo.id"
                :src="getAlbumCover(comicInfo.id)" 
                :alt="comicInfo.name"
                class="w-full h-full object-cover rounded-lg shadow-2xl"
                @error="handleImageError"
              />
              <div v-else class="w-full h-full bg-gray-700 rounded-lg animate-pulse"></div>
            </div>
            
            <!-- Comic Information -->
            <div class="flex-1 text-white text-center md:text-left">
              <h2 class="text-xl sm:text-2xl md:text-3xl font-bold mb-3">{{ comicInfo.name }}</h2>
              <p class="text-sm sm:text-base text-gray-300 mb-2">作者: {{ comicInfo.author?.join(' & ') || '未知' }}</p>
              <p class="text-sm sm:text-base text-gray-300 mb-4">ID: {{ comicId }}</p>
              
              <!-- Stats -->
              <div class="flex flex-wrap justify-center md:justify-start gap-3 sm:gap-6 mb-4">
                <div class="flex items-center gap-1 sm:gap-2">
                  <svg class="w-4 h-4 sm:w-5 sm:h-5 text-pink-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
                  </svg>
                  <span class="text-sm sm:text-base">{{ formatNumber(comicInfo.likes || 0) }}</span>
                  <span class="text-gray-400 text-xs sm:text-sm">({{ likesPercent }}%)</span>
                </div>
                <div class="flex items-center gap-1 sm:gap-2">
                  <svg class="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                  </svg>
                  <span class="text-sm sm:text-base">{{ formatNumber(comicInfo.total_views || 0) }}</span>
                </div>
                <div class="flex items-center gap-1 sm:gap-2">
                  <svg class="w-4 h-4 sm:w-5 sm:h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd" />
                  </svg>
                  <span class="text-sm sm:text-base">{{ formatNumber(comicInfo.comment_total || 0) }}</span>
                </div>
              </div>
              
              <!-- Tags -->
              <div v-if="allTags.length" class="flex flex-wrap gap-2 mb-6">
                <span 
                  v-for="tag in allTags" 
                  :key="tag"
                  @click="searchTag(tag)"
                  class="px-3 py-1 bg-gray-700/50 backdrop-blur rounded-full text-sm hover:bg-gray-600 transition-colors cursor-pointer"
                >
                  {{ tag }}
                </span>
              </div>
              
              <!-- Description -->
              <p v-if="comicInfo.description" class="text-gray-300 mb-6 line-clamp-3">
                {{ comicInfo.description }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs Section -->
      <div class="container mx-auto px-4 py-6">
        <!-- Tab Navigation -->
        <div class="flex border-b border-gray-700 mb-6">
          <button
            @click="activeTab = 'chapters'"
            :class="[
              'px-4 sm:px-6 py-3 font-semibold transition-colors text-sm sm:text-base',
              activeTab === 'chapters' 
                ? 'text-pink-500 border-b-2 border-pink-500' 
                : 'text-gray-400 hover:text-white'
            ]"
          >
            章节选择
          </button>
          <button
            @click="activeTab = 'comments'"
            :class="[
              'px-4 sm:px-6 py-3 font-semibold transition-colors flex items-center gap-2 text-sm sm:text-base',
              activeTab === 'comments' 
                ? 'text-pink-500 border-b-2 border-pink-500' 
                : 'text-gray-400 hover:text-white'
            ]"
          >
            评论
            <span class="text-xs sm:text-sm">({{ formatNumber(comicInfo.comment_total || 0) }})</span>
          </button>
        </div>

        <!-- Tab Content -->
        <div class="bg-gray-800 rounded-xl p-4 sm:p-6">
          <!-- Chapters Tab -->
          <div v-if="activeTab === 'chapters'" class="space-y-4">
            <!-- Series buttons -->
            <div v-if="comicInfo.series?.length" class="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
              <button
                v-for="(item, index) in comicInfo.series"
                :key="item.id"
                @click="handleChapterClick(item.id, index)"
                class="relative px-4 py-3 rounded-lg transition-all text-center cursor-pointer transform hover:scale-105 group border"
                :class="[
                  isChapterLocked(index) 
                    ? 'bg-gray-800 hover:bg-gray-700 hover:shadow-lg border-gray-700 hover:border-yellow-500' 
                    : 'bg-gray-700 hover:bg-gray-600 hover:shadow-lg border-gray-700 hover:border-green-500'
                ]"
              >
                <!-- Chapter Label (Free/Locked) -->
                <div class="absolute -top-2 -right-2 z-10 pointer-events-none">
                  <span 
                    v-if="!appStore.isLoggedIn && index < 3"
                    class="inline-flex items-center px-2 py-0.5 text-xs font-bold bg-green-500 text-white rounded-full"
                  >
                    免费
                  </span>
                  <span 
                    v-else-if="isChapterLocked(index)"
                    class="inline-flex items-center px-2 py-0.5 text-xs font-bold bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-full animate-pulse"
                  >
                    <svg class="w-3 h-3 mr-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    VIP
                  </span>
                </div>
                
                <div 
                  class="font-semibold transition-colors"
                  :class="{ 
                    'text-gray-400 group-hover:text-yellow-400': isChapterLocked(index),
                    'text-white group-hover:text-green-400': !isChapterLocked(index)
                  }"
                >
                  第{{ index + 1 }}章
                </div>
              </button>
            </div>
            
            <!-- Single chapter button (preview available for everyone) -->
            <div v-else class="flex flex-col items-center gap-4">
              <button
                @click="handleSingleChapterClick()"
                class="relative px-8 py-4 bg-pink-500 hover:bg-pink-600 rounded-lg transition-all flex items-center gap-3 cursor-pointer transform hover:scale-105 group hover:shadow-lg"
              >
                <!-- Preview Badge for non-VIP -->
                <div v-if="!isUserVip()" class="absolute -top-2 -right-2 z-10 pointer-events-none">
                  <span class="inline-flex items-center px-2 py-0.5 text-xs font-bold bg-green-500 text-white rounded-full">
                    免费预览
                  </span>
                </div>
                
                <svg class="w-6 h-6 text-white transition-colors" 
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span class="text-lg font-semibold text-white">
                  开始阅读
                </span>
              </button>
              
              <!-- Preview info -->
              <div class="text-center text-gray-400 text-sm">
                <p v-if="!isUserVip()">
                  <span class="text-green-400">✨ 免费预览前5页</span>
                  <span class="mx-2">•</span>
                  <span>VIP可阅读完整内容</span>
                </p>
                <router-link v-if="!appStore.isLoggedIn" to="/login" class="text-pink-500 hover:text-pink-400 font-medium">
                  立即登录
                </router-link>
                <button v-else @click="showVipPrompt = true" class="text-yellow-500 hover:text-yellow-400 font-medium">
                  成为VIP
                </button>
              </div>
            </div>
          </div>

          <!-- Comments Tab -->
          <div v-if="activeTab === 'comments'" class="space-y-4">
            <!-- Comments list -->
            <div v-if="comments.length" class="space-y-4">
              <div 
                v-for="comment in comments" 
                :key="comment.id"
                class="bg-gray-900 rounded-lg p-4 flex gap-4"
              >
                <div class="flex-shrink-0">
                  <img 
                    :src="getCommentAvatar(comment.photo)"
                    :alt="comment.username"
                    class="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover bg-gray-700"
                    @error="handleAvatarError"
                  />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="font-semibold text-white text-sm sm:text-base truncate">{{ comment.username }}</span>
                    <span class="text-xs text-gray-500">{{ comment.addtime }}</span>
                  </div>
                  <p class="text-gray-300 text-sm sm:text-base break-words">{{ stripHtml(comment.content) }}</p>
                </div>
              </div>
            </div>
            
            <!-- No comments -->
            <div v-else-if="!loadingComments" class="text-center py-8 text-gray-500">
              暂无评论
            </div>
            
            <!-- Loading comments -->
            <div v-if="loadingComments" class="flex justify-center py-8">
              <LoadingSpinner />
            </div>
            
            <!-- Load more button -->
            <button 
              v-if="hasMoreComments && !loadingComments"
              @click="loadMoreComments"
              class="w-full py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-medium transition-colors cursor-pointer"
            >
              加载更多评论
            </button>
          </div>
        </div>
      </div>
      
      <!-- Related Comics Section -->
      <div v-if="comicInfo.related_list && comicInfo.related_list.length > 0" class="container mx-auto px-4 pb-6">
        <div class="bg-gray-800 rounded-lg p-4 sm:p-6">
          <h2 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <svg class="w-6 h-6 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10 0h2a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2zM6 20h2a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z" />
            </svg>
            相关推荐
          </h2>
          
          <!-- Related Comics Grid - 3 columns on mobile, 6 on desktop -->
          <div class="grid grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          <router-link
            v-for="related in comicInfo.related_list.slice(0, 12)"
            :key="related.id"
            :to="`/chapter/${related.id}`"
            class="group relative bg-gray-800 rounded-lg overflow-hidden hover:shadow-xl hover:shadow-pink-500/20 transition-all duration-300 cursor-pointer"
          >
            <!-- Cover Image -->
            <div class="aspect-[3/4] relative overflow-hidden bg-gray-900">
              <img
                :src="getRelatedCover(related.id)"
                :alt="related.name"
                class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                loading="lazy"
                @error="handleImageError"
              />
              
              <!-- Gradient overlay -->
              <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none"></div>
            </div>
            
            <!-- Comic Info -->
            <div class="p-2 md:p-3">
              <h3 class="text-white font-medium text-xs md:text-sm mb-1 line-clamp-2 group-hover:text-pink-400 transition-colors">
                {{ related.name }}
              </h3>
              <p class="text-gray-400 text-xs line-clamp-1 hidden md:block">
                {{ related.author || 'N/A' }}
              </p>
            </div>
            
            <!-- Hover Effect -->
            <div class="absolute inset-0 border-2 border-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg pointer-events-none"></div>
          </router-link>
        </div>
        </div>
      </div>
    </div>

    <!-- Reading Mode (Fullscreen) -->
    <div v-if="isReading" ref="readingContainer" class="fixed inset-0 z-50 bg-black overflow-auto" @scroll="handleReadingScroll">
      <!-- Reading Header -->
      <div 
        class="fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 transition-transform duration-300"
        :style="{ transform: showHeader ? 'translateY(0)' : 'translateY(-100%)' }"
      >
        <div class="container mx-auto">
          <div class="flex items-center justify-between px-3 sm:px-4 py-2">
            <!-- Left section: Close button -->
            <button
              @click="exitReading"
              class="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-sm font-medium transition-all flex items-center gap-1.5"
              title="关闭 (ESC)"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span class="hidden sm:inline">关闭</span>
            </button>
            
            <!-- Center: Progress info -->
            <div class="hidden sm:flex items-center gap-3 text-sm flex-1 justify-center">
              <span class="text-white font-semibold text-base">{{ currentChapterTitle }}</span>
              <span class="text-gray-400">{{ currentImageIndex + 1 }}/{{ images.length }}</span>
            </div>
            <!-- Mobile Center: Only show title and progress -->
            <div class="flex sm:hidden items-center text-xs flex-1 justify-center px-2 gap-2">
              <span class="text-white font-semibold truncate">{{ currentChapterTitle }}</span>
              <span class="text-gray-400">{{ currentImageIndex + 1 }}/{{ images.length }}</span>
            </div>
            
            <!-- Right section: Auto-scroll toggle and chapter navigation buttons -->
            <div class="flex items-center gap-1 sm:gap-2">
              <!-- Auto-scroll settings button -->
              <button
                @click="showAutoScrollSettings = true"
                :class="[
                  'px-2 sm:px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1 sm:gap-1.5',
                  autoScrollEnabled 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-gray-600 hover:bg-gray-700 text-gray-300'
                ]"
                title="自动滚动设置"
              >
                <svg :class="['w-4 h-4', autoScrollEnabled && 'animate-spin-slow']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span class="hidden sm:inline">设置</span>
              </button>
              
              <button
                v-if="hasPrevChapter"
                @click="goToPrevChapter"
                class="px-2 sm:px-3 py-1.5 bg-gray-600 hover:bg-gray-700 rounded-lg text-white text-sm font-medium transition-all flex items-center gap-1 sm:gap-1.5"
                title="上一话"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
                <span class="hidden sm:inline">上一话</span>
              </button>
              
              <button
                v-if="hasNextChapter"
                @click="goToNextChapter"
                class="px-2 sm:px-3 py-1.5 bg-pink-500 hover:bg-pink-600 rounded-lg text-white text-sm font-medium transition-all flex items-center gap-1 sm:gap-1.5"
                title="下一话"
              >
                <span class="hidden sm:inline">下一话</span>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <!-- Progress bar -->
        <div class="h-0.5 bg-gray-800">
          <div 
            class="h-full bg-gradient-to-r from-pink-500 to-pink-400 transition-all duration-300 ease-out"
            :style="{ width: `${readingProgress}%` }"
          ></div>
        </div>
      </div>
      
      <!-- Always visible progress bar at top -->
      <div 
        class="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-800"
        :style="{ transform: !showHeader ? 'translateY(0)' : 'translateY(-100%)' }"
      >
        <div 
          class="h-full bg-gradient-to-r from-pink-500 to-pink-400 transition-all duration-300 ease-out"
          :style="{ width: `${readingProgress}%` }"
        ></div>
      </div>

      <!-- Floating Auto-scroll Control Button (only show when auto-scroll is enabled) -->
      <button
        v-if="autoScrollEnabled"
        @click="togglePauseAutoScroll"
        class="fixed bottom-4 left-4 z-[55] p-2.5 sm:p-3 bg-gray-800/20 hover:bg-gray-800/40 text-white/30 hover:text-white/50 rounded-full backdrop-blur-sm transition-all duration-200 shadow-lg"
        :title="autoScrollPaused ? '继续滚动' : '暂停滚动'"
      >
        <!-- Play Icon when paused -->
        <svg v-if="autoScrollPaused" class="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
        </svg>
        <!-- Pause Icon when playing -->
        <svg v-else class="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
      </button>

      <!-- Loading State -->
      <div v-if="loadingImages && !images.length" class="flex justify-center items-center h-screen">
        <div class="flex flex-col items-center">
          <LoadingSpinner />
        </div>
      </div>

      <!-- Error State -->
      <div v-if="readingError" class="flex justify-center items-center h-screen">
        <div class="bg-red-900/50 border border-red-700 rounded-lg p-6 text-center max-w-md">
          <svg class="w-12 h-12 text-red-400 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          <p class="text-red-400">{{ readingError }}</p>
          <div class="flex gap-3 justify-center mt-4">
            <button
              @click="retryLoading"
              class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              重试
            </button>
            <button
              @click="exitReading"
              class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              退出
            </button>
          </div>
        </div>
      </div>

      <!-- Images Container -->
      <div v-if="images.length" class="pt-10 pb-8 bg-black">
        <div class="max-w-3xl sm:max-w-4xl lg:max-w-5xl mx-auto">
          <div
            v-for="(image, index) in images"
            :key="index"
            :ref="el => imageRefs[index] = el"
            class="comic-image-container relative flex items-center justify-center"
            :class="{ 'min-h-[300px] sm:min-h-[500px]': !image.loaded }"
            :data-index="index"
          >
            <!-- Loading/Error states -->
            <div v-if="!image.loaded" class="flex items-center justify-center min-h-[300px] sm:min-h-[500px]">
              <!-- Loading state -->
              <div v-if="!image.error" class="flex flex-col items-center text-gray-400">
                <LoadingSpinner />
              </div>
              
              <!-- Error state -->
              <div 
                v-else
                @click="retryImage(index)"
                class="cursor-pointer text-red-400 hover:text-red-300 text-center"
              >
                <svg class="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
                <p>加载失败，点击重试</p>
              </div>
            </div>
            
            <!-- Canvas for processed images -->
            <canvas
              v-if="image.needProcess"
              v-show="image.loaded"
              :ref="el => canvasRefs[index] = el"
              class="w-full h-auto block"
            />
            
            <!-- Regular image -->
            <img
              v-if="!image.needProcess && image.loaded"
              :src="image.displaySrc || image.src"
              :alt="`Page ${index + 1}`"
              class="w-full h-auto block"
            />
          </div>
          
          <!-- VIP Required Notice for Preview Mode -->
          <div v-if="isPreviewMode" class="mt-8 p-6 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-yellow-500/30">
            <div class="text-center space-y-4">
              <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full mb-2">
                <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              
              <h3 class="text-xl font-bold text-white">需要VIP才能继续阅读</h3>
              
              <p class="text-gray-300">
                您已预览前5张图片（共{{ totalImages }}张）
              </p>
              
              <p class="text-gray-400 text-sm">
                开通VIP即可解锁全部内容，享受无限阅读体验
              </p>
              
              <div class="flex flex-col sm:flex-row gap-3 justify-center mt-6">
                <button
                  v-if="!appStore.isLoggedIn"
                  @click="showLoginPrompt = true"
                  class="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                >
                  立即登录
                </button>
                <button
                  @click="goToVipPage"
                  class="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white rounded-lg font-bold transition-all shadow-lg"
                >
                  <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span>立即开通VIP</span>
                </button>
              </div>
            </div>
          </div>
          
          <!-- Next Chapter Button -->
          <div v-if="hasNextChapter && !isPreviewMode" class="mt-8 flex justify-center">
            <button
              @click="loadNextChapter"
              class="px-8 py-4 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-lg hover:from-pink-600 hover:to-pink-700 transition-all shadow-lg flex items-center gap-3 text-lg font-semibold"
            >
              <span>下一话</span>
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      <!-- Auto-scroll Settings Modal -->
      <teleport to="body">
        <transition name="fade">
          <div v-if="showAutoScrollSettings" class="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-2 sm:p-4">
            <div class="bg-gray-900 rounded-lg sm:rounded-xl max-w-sm w-full p-3 sm:p-6 border border-gray-700">
              <h3 class="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4">自动滚动设置</h3>
              
              <!-- Speed Slider for Smooth Mode -->
              <div v-if="autoScrollMode === 'smooth'" class="mb-3 sm:mb-6">
                <label class="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">
                  滚动速度: {{ autoScrollSpeed }} 像素/秒
                </label>
                <input
                  type="range"
                  v-model="autoScrollSpeed"
                  @change="handleSpeedChange"
                  min="10"
                  max="500"
                  step="10"
                  class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                >
                <div class="flex justify-between text-[10px] sm:text-xs text-gray-500 mt-1">
                  <span>慢</span>
                  <span>中</span>
                  <span>快</span>
                  <span>极快</span>
                </div>
              </div>
              
              <!-- Settings for Stepped Mode -->
              <div v-if="autoScrollMode === 'stepped'" class="mb-3 sm:mb-6 space-y-3 sm:space-y-4">
                <div>
                  <label class="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">
                    跳动间隔: {{ stepInterval }} 秒
                  </label>
                  <input
                    type="range"
                    v-model="stepInterval"
                    @change="handleStepSettingsChange"
                    min="0.5"
                    max="5"
                    step="0.5"
                    class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  >
                  <div class="flex justify-between text-[10px] sm:text-xs text-gray-500 mt-1">
                    <span>快速</span>
                    <span>中等</span>
                    <span>缓慢</span>
                  </div>
                </div>
                
                <div>
                  <label class="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">
                    跳动距离: {{ stepSize }} 像素
                  </label>
                  <input
                    type="range"
                    v-model="stepSize"
                    @change="handleStepSettingsChange"
                    min="50"
                    max="800"
                    step="25"
                    class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  >
                  <div class="flex justify-between text-[10px] sm:text-xs text-gray-500 mt-1">
                    <span>小</span>
                    <span>中</span>
                    <span>大</span>
                    <span>特大</span>
                  </div>
                </div>
              </div>
              
              <!-- Scroll Mode -->
              <div class="mb-3 sm:mb-6">
                <label class="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">
                  滚动模式
                </label>
                <div class="grid grid-cols-2 gap-1.5 sm:gap-2">
                  <button
                    @click="setScrollMode('smooth')"
                    :class="[
                      'px-2 sm:px-3 py-1.5 sm:py-2 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium transition-all',
                      autoScrollMode === 'smooth'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    ]"
                  >
                    平滑滚动
                  </button>
                  <button
                    @click="setScrollMode('stepped')"
                    :class="[
                      'px-2 sm:px-3 py-1.5 sm:py-2 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium transition-all',
                      autoScrollMode === 'stepped'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    ]"
                  >
                    段落滚动
                  </button>
                </div>
                <p class="text-[10px] sm:text-xs text-gray-500 mt-1 sm:mt-2">
                  {{ autoScrollMode === 'smooth' ? '连续平滑滚动' : '模拟鼠标滚轮，一次跳一小段' }}
                </p>
              </div>
              
              <!-- Toggle Switch -->
              <div class="mb-3 sm:mb-6">
                <button
                  @click="toggleAutoScroll"
                  :class="[
                    'w-full py-2 sm:py-3 px-3 sm:px-4 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium transition-all',
                    autoScrollEnabled 
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  ]"
                >
                  <span v-if="!autoScrollEnabled">开启自动滚动</span>
                  <span v-else>关闭自动滚动</span>
                </button>
              </div>
              
              <!-- Load All Images Button -->
              <div class="mb-3 sm:mb-6">
                <button
                  @click="loadAllImages"
                  :disabled="loadingAllImages"
                  :class="[
                    'w-full py-2 sm:py-3 px-3 sm:px-4 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium transition-all',
                    loadingAllImages
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-400'
                  ]"
                >
                  <span v-if="!loadingAllImages">加载全部图片</span>
                  <span v-else class="flex items-center justify-center gap-1 sm:gap-2">
                    <svg class="animate-spin h-3 sm:h-4 w-3 sm:w-4" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span class="text-xs sm:text-sm">加载中... {{ loadedCount }}/{{ images.length }}</span>
                  </span>
                </button>
                <p class="text-[10px] sm:text-xs text-gray-500 mt-1 sm:mt-2">
                  立即加载所有图片，不再等待滚动触发
                </p>
              </div>
              
              <!-- Tips -->
              <div class="text-[10px] sm:text-xs text-gray-500 space-y-0.5 sm:space-y-1 mb-3 sm:mb-4">
                <p>• 自动滚动会在图片加载完成后继续</p>
              </div>
              
              <!-- Close Button -->
              <button
                @click="showAutoScrollSettings = false"
                class="w-full py-1.5 sm:py-2 px-3 sm:px-4 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </transition>
      </teleport>
    </div>
    
    <!-- Login Prompt Modal (moved outside reading mode) -->
    <ModalDialog
      v-model="showLoginPrompt"
      icon="lock"
      title="需要登录"
      message="登录后即可继续阅读"
      confirm-text="立即登录"
      cancel-text="注册账号"
      @confirm="handleLoginConfirm"
      @cancel="handleRegister"
    />
    
    <!-- VIP Prompt Modal (moved outside reading mode) -->
    <ModalDialog
      v-model="showVipPrompt"
      icon="warning"
      title="VIP专享内容"
      message="成为VIP会员，解锁全站所有内容"
      confirm-text="成为VIP"
      cancel-text="返回"
      confirm-button-class="bg-yellow-500 hover:bg-yellow-600 text-white"
      @confirm="handleVipUpgrade"
      @cancel="showVipPrompt = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { getComicAlbum, getComicChapter, getForumComments } from '@/api/request'
import { cutImage, getImageUrl, getMaxRequestCount } from '@/utils/image'
import { getImageServer } from '@/utils/imageServer'
import { formatNumber } from '@/utils/format'
import { checkCollection, toggleCollection } from '@/api/collection'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import ModalDialog from '@/components/ModalDialog.vue'
import PageHeader from '@/components/PageHeader.vue'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

// Main comic info
const comicId = computed(() => route.params.id)
const comicInfo = ref({})
const isFavorited = ref(false) // Track favorite status from API
const comments = ref([])
const loading = ref(false)
const loadingComments = ref(false)
const error = ref('')
const currentCommentPage = ref(1)
const hasMoreComments = ref(true)
const activeTab = ref('chapters')

// Reading mode
const isReading = ref(false)
const currentReadingId = ref(null)
const readingTitle = ref('')
const images = ref([])
const loadingImages = ref(false)
const readingError = ref('')
const loadedCount = ref(0)
const currentImageIndex = ref(0)
const lastScrollPosition = ref(0)
const isPreviewMode = ref(false)
const totalImages = ref(0)
const lastReadChapterId = ref(null)
const showHeader = ref(true) // Control header visibility
const lastScrollY = ref(0)

// Auto-scroll feature
const autoScrollEnabled = ref(localStorage.getItem('autoScrollEnabled') === 'true') // Global setting
const autoScrollPaused = ref(true) // Always start paused when loading a chapter
const autoScrollSpeed = ref(parseInt(localStorage.getItem('autoScrollSpeed')) || 50) // pixels per second (for smooth mode)
const autoScrollMode = ref(localStorage.getItem('autoScrollMode') || 'smooth') // 'smooth' or 'stepped'
const stepInterval = ref(parseFloat(localStorage.getItem('stepInterval')) || 2) // seconds between steps
const stepSize = ref(parseInt(localStorage.getItem('stepSize')) || 150) // pixels per step
const autoScrollInterval = ref(null)
const showAutoScrollSettings = ref(false)
const loadingAllImages = ref(false)

// Reading history
const readingHistory = ref({}) // { comicId: chapterIndex }

// Refs for DOM elements
const imageRefs = ref([])
const canvasRefs = ref([])
const readingContainer = ref(null)
const chapterHeader = ref(null)
const isHeaderSticky = ref(false)

// Login/VIP prompt modals
const showLoginPrompt = ref(false)
const showVipPrompt = ref(false)

// Image loading queue
let loadingQueue = []
let activeRequests = 0
let observer = null

// Computed properties
const isCollected = computed(() => isFavorited.value)
const allTags = computed(() => {
  const tags = [...(comicInfo.value.tags || [])]
  const actors = comicInfo.value.actors || []
  return [...tags, ...actors].filter(Boolean)
})
const likesPercent = computed(() => {
  const likes = comicInfo.value.likes || 0
  const views = comicInfo.value.total_views || 1
  return Math.floor((likes / views) * 100)
})
const readingProgress = computed(() => {
  if (!images.value.length) return 0
  // Calculate progress based on current viewed image position
  return Math.floor(((currentImageIndex.value + 1) / images.value.length) * 100)
})

const currentChapterTitle = computed(() => {
  if (!currentReadingId.value) return ''
  
  if (comicInfo.value.series?.length) {
    const index = comicInfo.value.series.findIndex(s => s.id == currentReadingId.value)
    if (index >= 0) {
      return `第${index + 1}章`
    }
  }
  return '第1章'
})

const hasPrevChapter = computed(() => {
  if (!comicInfo.value.series?.length || !currentReadingId.value) return false
  
  const currentIndex = comicInfo.value.series.findIndex(s => s.id == currentReadingId.value)
  return currentIndex > 0
})

const prevChapterId = computed(() => {
  if (!hasPrevChapter.value) return null
  
  const currentIndex = comicInfo.value.series.findIndex(s => s.id == currentReadingId.value)
  if (currentIndex > 0) {
    return comicInfo.value.series[currentIndex - 1].id
  }
  return null
})

const hasNextChapter = computed(() => {
  if (!comicInfo.value.series?.length || !currentReadingId.value) return false
  
  const currentIndex = comicInfo.value.series.findIndex(s => s.id == currentReadingId.value)
  return currentIndex >= 0 && currentIndex < comicInfo.value.series.length - 1
})

const nextChapterId = computed(() => {
  if (!hasNextChapter.value) return null
  
  const currentIndex = comicInfo.value.series.findIndex(s => s.id == currentReadingId.value)
  if (currentIndex >= 0 && currentIndex < comicInfo.value.series.length - 1) {
    return comicInfo.value.series[currentIndex + 1].id
  }
  return null
})

// Methods
const getAlbumCover = (id) => {
  const server = getImageServer()
  return `${server}/media/albums/${id}_3x4.jpg`
}

const getCommentAvatar = (photo) => {
  if (!photo || photo === 'nopic-Male.gif') {
    return '/default.jpeg'
  }
  return `https://${appStore.primaryServer}/media/users/${photo}`
}

const handleImageError = (e) => {
  e.target.src = '/default.jpeg'
}

const handleAvatarError = (e) => {
  e.target.src = '/default.jpeg'
}

const getRelatedCover = (id) => {
  const server = getImageServer()
  return `${server}/media/albums/${id}_3x4.jpg`
}

const toggleCollect = async () => {
  if (!appStore.isLoggedIn) {
    showLoginPrompt.value = true
    return
  }
  
  try {
    const response = await toggleCollection({
      id: comicId.value,
      name: comicInfo.value.name,
      author: comicInfo.value.author?.join(' & ')
    })
    
    // Update local state based on response
    if ('is_collected' in response) {
      isFavorited.value = response.is_collected
      console.log('Toggled favorite, new status:', response.is_collected)
    }
  } catch (error) {
    console.error('Failed to toggle favorite:', error)
  }
}


const stripHtml = (html) => {
  const tmp = document.createElement('DIV')
  tmp.innerHTML = html
  return tmp.textContent || tmp.innerText || ''
}

// Load comic info and comments (initial load)
const loadComicInfo = async () => {
  loading.value = true
  error.value = ''
  
  try {
    // Load comic album info
    const albumData = await getComicAlbum(comicId.value)
    comicInfo.value = albumData
    
    console.log('Album data:', albumData)
    
    // Check favorite status separately if user is logged in
    if (appStore.isLoggedIn) {
      try {
        const favStatus = await checkCollection(comicId.value)
        isFavorited.value = favStatus.is_collected || false
        console.log('Favorite status:', favStatus)
      } catch (err) {
        console.error('Failed to check favorite status:', err)
        isFavorited.value = false
      }
    } else {
      isFavorited.value = false
    }
    
    // Load initial comments when opening comments tab
    if (activeTab.value === 'comments' && !comments.value.length) {
      loadComments()
    }
  } catch (err) {
    console.error('Failed to load comic info:', err)
    error.value = '加载失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

// Load reading history from localStorage
const loadReadingHistory = () => {
  const history = localStorage.getItem('chapterReadingHistory')
  if (history) {
    readingHistory.value = JSON.parse(history)
  }
}

// Save reading history to localStorage
const saveReadingHistory = (chapterId) => {
  let history = { ...readingHistory.value }
  const currentComicId = comicId.value
  
  // Find the chapter index - save only the latest clicked chapter
  if (comicInfo.value.series?.length) {
    const chapterIndex = comicInfo.value.series.findIndex(s => s.id == chapterId)
    if (chapterIndex >= 0) {
      history[currentComicId] = chapterIndex
    }
  } else {
    // Single chapter comic
    history[currentComicId] = 0
  }
  
  // Keep only last 10 comics (remove oldest if exceeds limit)
  const entries = Object.entries(history)
  if (entries.length > 10) {
    // Get the keys array and remove the first (oldest) entry
    const keys = Object.keys(history)
    delete history[keys[0]]
  }
  
  readingHistory.value = history
  localStorage.setItem('chapterReadingHistory', JSON.stringify(history))
}


// Helper function to check if user is VIP
const isUserVip = () => {
  if (!appStore.user?.vip_expired_at) return false
  return new Date(appStore.user.vip_expired_at) > new Date()
}

// Check if a chapter is locked (non-VIP users can only access first 3 chapters)
const isChapterLocked = (index) => {
  // If user is VIP, nothing is locked
  if (appStore.isLoggedIn && isUserVip()) {
    return false
  }
  
  // For multi-chapter comics, first 3 chapters are free for everyone
  if (comicInfo.value.series?.length) {
    return index >= 3
  }
  
  // Single chapter comics are free to preview (first 5 images)
  return false
}

// Handle chapter click with lock check
const handleChapterClick = (chapterId, index) => {
  console.log('Chapter clicked:', chapterId, 'Index:', index, 'Locked:', isChapterLocked(index))
  
  if (isChapterLocked(index)) {
    // Show appropriate prompt based on login status
    if (!appStore.isLoggedIn) {
      showLoginPrompt.value = true
    } else {
      showVipPrompt.value = true
    }
  } else {
    startReading(chapterId)
  }
}

// Handle single chapter click - allow preview for non-VIP users
const handleSingleChapterClick = () => {
  // Allow everyone to start reading (will show VIP prompt after 5 images)
  startReading(comicId.value, true) // true indicates this is a single chapter
}

// Navigate to VIP page after exiting reading mode
const goToVipPage = () => {
  exitReading()
  router.push('/vip')
}

// Handle login confirm
const handleLoginConfirm = () => {
  showLoginPrompt.value = false
  router.push({
    path: '/login',
    query: { redirect: route.fullPath }
  })
}

// Handle register
const handleRegister = () => {
  showLoginPrompt.value = false
  router.push({
    path: '/register',
    query: { redirect: route.fullPath }
  })
}

// Handle VIP upgrade
const handleVipUpgrade = () => {
  showVipPrompt.value = false
  // Navigate to VIP page
  router.push('/vip')
}

// Start reading a specific series/chapter
const startReading = async (seriesId, isSingleChapter = false) => {
  // Save current scroll position
  lastScrollPosition.value = window.scrollY
  lastReadChapterId.value = seriesId
  showHeader.value = true // Reset header visibility
  lastScrollY.value = 0
  
  // Save to reading history
  saveReadingHistory(seriesId)
  
  // Prevent body scroll when in reading mode
  document.body.style.overflow = 'hidden'
  
  currentReadingId.value = seriesId
  isReading.value = true
  loadingImages.value = true
  readingError.value = ''
  images.value = []
  loadedCount.value = 0
  currentImageIndex.value = 0
  
  // If auto-scroll is globally enabled, ensure it starts paused for new chapter
  if (autoScrollEnabled.value) {
    autoScrollPaused.value = true
    // Clear any running interval
    if (autoScrollInterval.value) {
      clearInterval(autoScrollInterval.value)
      autoScrollInterval.value = null
    }
  }
  
  // Find series name
  if (comicInfo.value.series?.length) {
    const series = comicInfo.value.series.find(s => s.id == seriesId)
    const index = comicInfo.value.series.findIndex(s => s.id == seriesId)
    readingTitle.value = `${comicInfo.value.name} - 第${index + 1}章`
  } else {
    readingTitle.value = comicInfo.value.name
  }
  
  try {
    // Load chapter images
    const chapterData = await getComicChapter(seriesId)
    console.log('Chapter data for', seriesId, ':', chapterData)
    
    if (chapterData.images && chapterData.images.length) {
      // Check if we need to limit images for non-VIP users (single chapter preview)
      const isVip = appStore.isLoggedIn && isUserVip()
      const shouldLimitImages = isSingleChapter && !isVip
      const maxPreviewImages = 5
      
      // Initialize image objects
      const allImages = chapterData.images
      const imagesToShow = shouldLimitImages ? allImages.slice(0, maxPreviewImages) : allImages
      
      images.value = imagesToShow.map((imageName, index) => ({
        name: imageName,
        src: getImageUrl(getImageServer(), seriesId, imageName),
        loaded: false,
        loading: false,
        error: false,
        needProcess: parseInt(seriesId) >= 220980 && !imageName.includes('.gif'),
        index
      }))
      
      // Store info about whether we're limiting images
      isPreviewMode.value = shouldLimitImages
      totalImages.value = allImages.length
      
      // Start lazy loading after DOM update
      await nextTick()
      setupLazyLoading()
      // Initialize current image index
      updateCurrentImageIndex()
    } else {
      readingError.value = '没有找到章节内容'
    }
  } catch (err) {
    console.error('Failed to load chapter:', err)
    readingError.value = '加载失败，请稍后重试'
  } finally {
    loadingImages.value = false
  }
}

// Exit reading mode
// Handle scroll in reading mode
const handleReadingScroll = (event) => {
  const currentScrollY = event.target.scrollTop
  
  // Show header when scrolling up or at the top
  if (currentScrollY < lastScrollY.value || currentScrollY < 50) {
    showHeader.value = true
  } 
  // Hide header when scrolling down
  else if (currentScrollY > lastScrollY.value && currentScrollY > 50) {
    showHeader.value = false
  }
  
  lastScrollY.value = currentScrollY
  
  // Update current image index based on scroll position
  updateCurrentImageIndex()
}

// Update current image index based on scroll position
const updateCurrentImageIndex = () => {
  if (!readingContainer.value || !imageRefs.value.length) return
  
  const container = readingContainer.value
  const scrollTop = container.scrollTop
  const viewportHeight = container.clientHeight
  const viewportCenter = scrollTop + (viewportHeight / 2)
  
  // Find which image is at the center of viewport
  for (let i = 0; i < imageRefs.value.length; i++) {
    const ref = imageRefs.value[i]
    if (ref) {
      const rect = ref.getBoundingClientRect()
      const containerRect = container.getBoundingClientRect()
      const imageTop = rect.top - containerRect.top + scrollTop
      const imageBottom = imageTop + ref.offsetHeight
      
      // Check if viewport center is within this image
      if (viewportCenter >= imageTop && viewportCenter <= imageBottom) {
        currentImageIndex.value = i
        break
      }
    }
  }
}

const exitReading = () => {
  // Pause auto-scroll if it's running (but keep it enabled globally)
  if (autoScrollEnabled.value && !autoScrollPaused.value) {
    pauseAutoScroll()
    autoScrollPaused.value = true
  }
  
  isReading.value = false
  currentReadingId.value = null
  images.value = []
  loadedCount.value = 0
  currentImageIndex.value = 0
  showHeader.value = true // Reset header visibility
  lastScrollY.value = 0
  if (observer) {
    observer.disconnect()
    observer = null
  }
  
  // Restore body scroll
  document.body.style.overflow = ''
  
  // Restore scroll position after DOM update
  nextTick(() => {
    window.scrollTo(0, lastScrollPosition.value)
  })
}

// Load next chapter
const loadNextChapter = () => {
  if (nextChapterId.value) {
    // Pause auto-scroll if it's running
    if (autoScrollEnabled.value && !autoScrollPaused.value) {
      pauseAutoScroll()
      autoScrollPaused.value = true
    }
    
    // Clear current images and observer
    images.value = []
    loadedCount.value = 0
    currentImageIndex.value = 0
    if (observer) {
      observer.disconnect()
      observer = null
    }
    
    // Scroll to top of reading container
    if (readingContainer.value) {
      readingContainer.value.scrollTo({ top: 0, behavior: 'smooth' })
    }
    
    // Load next chapter
    startReading(nextChapterId.value)
  }
}

// Go to next chapter (for button click)
const goToNextChapter = () => {
  loadNextChapter()
}

// Go to previous chapter (for button click)
const goToPrevChapter = () => {
  if (prevChapterId.value) {
    // Pause auto-scroll if it's running
    if (autoScrollEnabled.value && !autoScrollPaused.value) {
      pauseAutoScroll()
      autoScrollPaused.value = true
    }
    
    // Clear current images and observer
    images.value = []
    loadedCount.value = 0
    currentImageIndex.value = 0
    if (observer) {
      observer.disconnect()
      observer = null
    }
    
    // Scroll to top of reading container
    if (readingContainer.value) {
      readingContainer.value.scrollTo({ top: 0, behavior: 'smooth' })
    }
    
    // Load previous chapter
    startReading(prevChapterId.value)
  }
}

// Retry loading images
const retryLoading = () => {
  if (currentReadingId.value) {
    startReading(currentReadingId.value)
  }
}

// Load comments
const loadComments = async () => {
  if (loadingComments.value) return
  
  loadingComments.value = true
  currentCommentPage.value = 1
  comments.value = []
  
  try {
    const commentList = await getForumComments(comicId.value, 1)
    console.log('Loaded comments:', commentList.length)
    comments.value = commentList
    // Show load more button if we got a full page of comments (likely more available)
    hasMoreComments.value = commentList.length >= 10
    console.log('Has more comments:', hasMoreComments.value)
  } catch (err) {
    console.error('Failed to load comments:', err)
  } finally {
    loadingComments.value = false
  }
}

// Load more comments
const loadMoreComments = async () => {
  if (loadingComments.value || !hasMoreComments.value) return
  
  loadingComments.value = true
  
  try {
    const nextPage = currentCommentPage.value + 1
    console.log('Loading more comments, page:', nextPage)
    const commentList = await getForumComments(comicId.value, nextPage)
    console.log('Loaded more comments:', commentList.length)
    
    if (commentList.length === 0) {
      hasMoreComments.value = false
    } else {
      currentCommentPage.value = nextPage
      comments.value.push(...commentList)
      // Check if we should show the button for next page
      hasMoreComments.value = commentList.length >= 10
    }
  } catch (err) {
    console.error('Failed to load more comments:', err)
  } finally {
    loadingComments.value = false
  }
}

// Load single image
const loadImage = async (index) => {
  const imageData = images.value[index]
  if (!imageData || imageData.loaded || imageData.loading) return Promise.resolve()
  
  return new Promise(async (resolveMain) => {
    imageData.loading = true
    
    // Wait if too many concurrent requests
    const maxRequests = getMaxRequestCount()
    while (activeRequests >= maxRequests) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    activeRequests++
    
    try {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      
      await new Promise((resolve, reject) => {
        img.onload = async () => {
          // Process image if needed
          if (imageData.needProcess) {
            const pageName = imageData.name.substring(0, 5)
            console.log(`Processing image ${index} with page ${pageName}`)
            await nextTick()
            const canvas = canvasRefs.value[index]
            if (canvas) {
              const processedCanvas = cutImage(img, parseInt(currentReadingId.value), pageName)
              canvas.width = processedCanvas.width
              canvas.height = processedCanvas.height
              const ctx = canvas.getContext('2d')
              ctx.drawImage(processedCanvas, 0, 0)
            }
          } else {
            imageData.displaySrc = img.src
          }
          
          imageData.loaded = true
          imageData.error = false
          loadedCount.value++
          resolve()
        }
        
        img.onerror = () => {
          imageData.error = true
          reject(new Error('Failed to load image'))
        }
        
        img.src = imageData.src
      })
    } catch (err) {
      console.error(`Failed to load image ${index}:`, err)
      imageData.error = true
    } finally {
      imageData.loading = false
      activeRequests--
      
      // Load next image in queue
      const nextIndex = loadingQueue.shift()
      if (nextIndex !== undefined) {
        loadImage(nextIndex)
      }
      
      resolveMain() // Resolve the main promise
    }
  })
}

// Retry single image
const retryImage = (index) => {
  images.value[index].error = false
  images.value[index].loaded = false
  loadImage(index)
}

// Setup lazy loading for images
const setupLazyLoading = () => {
  if (observer) {
    observer.disconnect()
  }
  
  // Observer for lazy loading only
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const index = parseInt(entry.target.dataset.index)
          const imageData = images.value[index]
          
          if (!imageData.loaded && !imageData.loading) {
            const maxRequests = getMaxRequestCount()
            if (activeRequests < maxRequests) {
              loadImage(index)
            } else {
              if (!loadingQueue.includes(index)) {
                loadingQueue.push(index)
              }
            }
          }
        }
      })
    },
    { rootMargin: '200px' }
  )
  
  // Use nextTick to ensure DOM is updated
  nextTick(() => {
    imageRefs.value.forEach((ref, index) => {
      if (ref) {
        observer.observe(ref)
      }
    })
  })
}

// Handle scroll for sticky header
const handleScroll = () => {
  // Handle sticky header
  if (!isReading.value && chapterHeader.value) {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    // Stick header after scrolling 200px
    isHeaderSticky.value = scrollTop > 200
  }
}

// Handle ESC key to exit reading mode
const handleKeydown = (e) => {
  if (e.key === 'Escape' && isReading.value) {
    exitReading()
  }
}

// Watch for route changes
watch(comicId, () => {
  loadComicInfo()
})

// Watch for tab changes to load comments
watch(activeTab, (newTab) => {
  if (newTab === 'comments' && !comments.value.length && !loadingComments.value) {
    loadComments()
  }
})

// Search tag function
const searchTag = (tag) => {
  router.push({
    path: '/search',
    query: { q: tag }
  })
}

// Auto-scroll functions
const toggleAutoScroll = () => {
  if (autoScrollEnabled.value) {
    stopAutoScroll()
  } else {
    startAutoScroll()
  }
}

// Toggle pause/resume for floating button
const togglePauseAutoScroll = () => {
  if (autoScrollPaused.value) {
    // Resume scrolling
    autoScrollPaused.value = false
    resumeAutoScroll()
  } else {
    // Pause scrolling
    autoScrollPaused.value = true
    pauseAutoScroll()
  }
}

// Pause auto-scroll without disabling it
const pauseAutoScroll = () => {
  if (autoScrollInterval.value) {
    clearInterval(autoScrollInterval.value)
    autoScrollInterval.value = null
  }
}

// Resume auto-scroll
const resumeAutoScroll = () => {
  if (!autoScrollEnabled.value) return
  
  // Clear any existing interval
  if (autoScrollInterval.value) {
    clearInterval(autoScrollInterval.value)
  }
  
  // Restart based on current mode
  if (autoScrollMode.value === 'smooth') {
    autoScrollInterval.value = setInterval(() => {
      if (!readingContainer.value) return
      
      const container = readingContainer.value
      const currentScroll = container.scrollTop
      const maxScroll = container.scrollHeight - container.clientHeight
      
      if (currentScroll >= maxScroll - 10) {
        stopAutoScroll()
        return
      }
      
      const scrollStep = autoScrollSpeed.value / 20
      const nextScrollPosition = currentScroll + scrollStep
      
      container.scrollTo({
        top: nextScrollPosition,
        behavior: 'auto'
      })
    }, 50)
  } else {
    const interval = stepInterval.value * 1000
    
    autoScrollInterval.value = setInterval(() => {
      nextTick(() => {
        const container = readingContainer.value
        if (!container) return
        
        const currentScroll = container.scrollTop
        const maxScroll = container.scrollHeight - container.clientHeight
        
        if (currentScroll >= maxScroll - 10) {
          stopAutoScroll()
          return
        }
        
        container.scrollBy({
          top: stepSize.value,
          behavior: 'smooth'
        })
      })
    }, interval)
  }
}

// Handle speed change - save and restart if running
const handleSpeedChange = () => {
  // Save to localStorage
  localStorage.setItem('autoScrollSpeed', autoScrollSpeed.value.toString())
  
  // If auto-scroll is running, restart it with new speed
  if (autoScrollEnabled.value) {
    stopAutoScroll()
    startAutoScroll()
  }
}

// Set scroll mode and restart if running
const setScrollMode = (mode) => {
  autoScrollMode.value = mode
  localStorage.setItem('autoScrollMode', mode)
  
  // If auto-scroll is running, restart it with new mode
  if (autoScrollEnabled.value) {
    stopAutoScroll()
    startAutoScroll()
  }
}

// Handle step settings change - save and restart if running
const handleStepSettingsChange = () => {
  // Save to localStorage
  localStorage.setItem('stepInterval', stepInterval.value.toString())
  localStorage.setItem('stepSize', stepSize.value.toString())
  
  // If auto-scroll is running in stepped mode, restart it
  if (autoScrollEnabled.value && autoScrollMode.value === 'stepped') {
    stopAutoScroll()
    startAutoScroll()
  }
}

const startAutoScroll = () => {
  autoScrollEnabled.value = true
  autoScrollPaused.value = false // Start scrolling immediately
  localStorage.setItem('autoScrollEnabled', 'true') // Save to localStorage
  
  // Clear any existing interval
  if (autoScrollInterval.value) {
    clearInterval(autoScrollInterval.value)
  }
  
  // Start auto-scrolling based on mode
  if (autoScrollMode.value === 'smooth') {
    // Smooth continuous scrolling
    autoScrollInterval.value = setInterval(() => {
      if (!readingContainer.value) return
      
      const container = readingContainer.value
      const currentScroll = container.scrollTop
      const maxScroll = container.scrollHeight - container.clientHeight
      
      // Check if we've reached the bottom
      if (currentScroll >= maxScroll - 10) {
        stopAutoScroll()
        return
      }
      
      // Calculate the next scroll position
      const scrollStep = autoScrollSpeed.value / 20 // Divide by 20 for 50ms interval (20 times per second)
      const nextScrollPosition = currentScroll + scrollStep
      
      // Perform the scroll directly without checking image loading
      container.scrollTo({
        top: nextScrollPosition,
        behavior: 'auto'
      })
    }, 50) // Update every 50ms for smooth scrolling
  } else {
    // Stepped scrolling (like mouse wheel)
    const interval = stepInterval.value * 1000 // Convert seconds to milliseconds
    
    autoScrollInterval.value = setInterval(() => {
      // Wait for container to be available
      nextTick(() => {
        const container = readingContainer.value
        if (!container) return
        
        const currentScroll = container.scrollTop
        const maxScroll = container.scrollHeight - container.clientHeight
        
        // Check if we've reached the bottom
        if (currentScroll >= maxScroll - 10) {
          stopAutoScroll()
          return
        }
        
        // Perform the stepped scroll directly without checking image loading
        container.scrollBy({
          top: stepSize.value,
          behavior: 'smooth'
        })
      })
    }, interval) // Fixed interval based on user settings
  }
}

const stopAutoScroll = () => {
  autoScrollEnabled.value = false
  autoScrollPaused.value = false // Reset pause state
  localStorage.setItem('autoScrollEnabled', 'false') // Save to localStorage
  
  if (autoScrollInterval.value) {
    clearInterval(autoScrollInterval.value)
    autoScrollInterval.value = null
  }
}

// Load all images at once (bypass lazy loading)
const loadAllImages = async () => {
  if (!images.value.length || loadingAllImages.value) return
  
  loadingAllImages.value = true
  
  try {
    // Clear the lazy loading observer temporarily
    if (observer) {
      observer.disconnect()
    }
    
    // Get all unloaded images
    const unloadedImages = []
    images.value.forEach((img, index) => {
      if (!img.loaded && !img.loading && !img.error) {
        unloadedImages.push(index)
      }
    })
    
    if (unloadedImages.length === 0) {
      // All images are already loaded
      loadingAllImages.value = false
      return
    }
    
    console.log(`Loading ${unloadedImages.length} images...`)
    
    // Load images in batches to avoid overwhelming the browser
    const batchSize = 5 // Load 5 images at a time
    for (let i = 0; i < unloadedImages.length; i += batchSize) {
      const batch = unloadedImages.slice(i, i + batchSize)
      
      // Load this batch of images
      await Promise.all(
        batch.map(index => {
          // Return a promise that resolves when the image loads or errors
          return new Promise((resolve) => {
            loadImage(index).finally(() => resolve())
          })
        })
      )
      
      // Small delay between batches to avoid freezing the UI
      if (i + batchSize < unloadedImages.length) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }
    
    console.log('All images loaded successfully')
    
    // Re-enable lazy loading observer
    await nextTick()
    setupLazyLoading()
    
  } catch (error) {
    console.error('Failed to load all images:', error)
  } finally {
    loadingAllImages.value = false
  }
}


// Lifecycle hooks
onMounted(() => {
  loadReadingHistory() // Load reading history first
  loadComicInfo()
  window.addEventListener('scroll', handleScroll)
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  // Clean up auto-scroll
  stopAutoScroll()
  
  if (observer) {
    observer.disconnect()
  }
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Fade transition for modal */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Custom slider styles */
.slider::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  background: #10b981;
  border-radius: 50%;
  cursor: pointer;
}

.slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  background: #10b981;
  border-radius: 50%;
  cursor: pointer;
  border: none;
}

.slider::-webkit-slider-thumb:hover {
  background: #059669;
}

.slider::-moz-range-thumb:hover {
  background: #059669;
}

/* Slow spin animation for settings icon when auto-scroll is active */
@keyframes spin-slow {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin-slow {
  animation: spin-slow 3s linear infinite;
}
</style>
