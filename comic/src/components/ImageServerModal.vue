<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-all duration-300"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="visible"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="close"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
        
        <!-- Dialog -->
        <Transition
          enter-active-class="transition-all duration-300"
          enter-from-class="opacity-0 scale-90"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition-all duration-200"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-90"
        >
          <div
            v-if="visible"
            class="relative bg-gray-900 rounded-xl p-3 sm:p-4 w-full max-w-xl"
          >
            <!-- Header -->
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-2 sm:gap-3">
                <div class="p-1.5 sm:p-2 bg-pink-600/20 rounded-lg">
                  <svg
                    class="w-4 h-4 sm:w-5 sm:h-5 text-pink-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                  </svg>
                </div>
                <div>
                  <h3 class="text-base sm:text-lg font-bold text-white">图片服务器选择</h3>
                  <p class="text-xs sm:text-sm text-gray-400 hidden sm:block">选择最快的服务器</p>
                </div>
              </div>
              
              <!-- Close button -->
              <button
                @click="close"
                class="text-gray-400 hover:text-white transition-colors p-1.5 sm:p-2 hover:bg-gray-800 rounded-lg cursor-pointer"
              >
                <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <!-- Content -->
            <div>
              <!-- Loading State -->
              <div v-if="loading" class="py-8">
                <div class="animate-pulse space-y-3">
                  <div class="bg-gray-800 rounded-lg h-32"></div>
                  <div class="bg-gray-800 rounded-lg h-16"></div>
                  <div class="bg-gray-800 rounded-lg h-16"></div>
                </div>
              </div>
              
              <!-- Error State -->
              <div v-else-if="error" class="text-center py-8">
                <svg class="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p class="text-gray-400">{{ error }}</p>
                <button
                  @click="fetchServers"
                  class="mt-4 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition-colors"
                >
                  重试
                </button>
              </div>
              
              <!-- Main Content -->
              <div v-else>
                <!-- Test Image Section -->
                <div class="bg-gray-800 rounded-lg p-2.5 mb-2.5">
                  <div class="flex items-center gap-3">
                    <!-- Test Image -->
                    <div class="relative w-16 h-20 sm:w-20 sm:h-24 bg-gray-700 rounded overflow-hidden flex-shrink-0">
                      <img
                        v-if="testImageUrl"
                        :key="testImageUrl"
                        :src="testImageUrl"
                        alt="测试图片"
                        class="w-full h-full object-cover"
                        @load="onTestImageLoad"
                        @error="onTestImageError"
                      />
                      <div v-if="testImageLoading" class="absolute inset-0 flex items-center justify-center bg-gray-700/80">
                        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-500"></div>
                      </div>
                      <div v-if="testImageError" class="absolute inset-0 flex items-center justify-center bg-gray-700/80">
                        <svg class="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                    </div>
                    
                    <!-- Test Result -->
                    <div class="flex-1">
                      <h4 class="text-xs font-semibold text-gray-400 mb-1">测试结果</h4>
                      <div v-if="testImageLoadTime !== null && !testImageError">
                        <p class="text-xl sm:text-2xl font-bold"
                          :class="{
                            'text-green-400': testImageLoadTime < 500,
                            'text-yellow-400': testImageLoadTime >= 500 && testImageLoadTime < 1500,
                            'text-red-400': testImageLoadTime >= 1500
                          }">
                          {{ testImageLoadTime }} ms
                        </p>
                        <p class="text-xs text-gray-400 mt-1">加载时间</p>
                      </div>
                      <div v-else-if="testImageError">
                        <p class="text-red-400 font-semibold">加载失败</p>
                        <p class="text-xs text-gray-400 mt-1">服务器不可用</p>
                      </div>
                      <div v-else-if="testImageLoading">
                        <p class="text-gray-400">测试中...</p>
                      </div>
                      <div v-else>
                        <p class="text-gray-500 text-sm">选择服务器开始测试</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Servers List -->
                <div class="space-y-1.5">
                  <h4 class="text-xs font-semibold text-gray-400 mb-1.5">选择服务器</h4>
                  <div
                    v-for="server in servers"
                    :key="server.id"
                    @click="selectServer(server)"
                    class="bg-gray-800 hover:bg-gray-750 rounded-lg p-2 cursor-pointer transition-all border-2 relative"
                    :class="selectedServer === server.url ? 'border-pink-500 bg-gray-750' : 'border-transparent'"
                  >
                    <div class="flex items-center justify-between">
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2">
                          <h4 class="text-sm font-semibold text-white">{{ server.name }}</h4>
                          <span 
                            v-if="serverLoadTimes[server.url] && serverLoadTimes[server.url] > 0"
                            class="px-1.5 py-0.5 text-[10px] rounded-full font-medium"
                            :class="{
                              'bg-green-500/20 text-green-400': serverLoadTimes[server.url] < 500,
                              'bg-yellow-500/20 text-yellow-400': serverLoadTimes[server.url] >= 500 && serverLoadTimes[server.url] < 1500,
                              'bg-red-500/20 text-red-400': serverLoadTimes[server.url] >= 1500
                            }"
                          >
                            {{ serverLoadTimes[server.url] }}ms
                          </span>
                          <span 
                            v-else-if="serverLoadTimes[server.url] === -1"
                            class="px-1.5 py-0.5 text-[10px] rounded-full font-medium bg-red-500/20 text-red-400"
                          >
                            失败
                          </span>
                        </div>
                        <p class="text-[10px] text-gray-500 font-mono truncate">{{ server.url }}</p>
                      </div>
                      <div
                        v-if="selectedServer === server.url"
                        class="ml-2 p-1 sm:p-1.5 bg-pink-600 rounded flex-shrink-0"
                      >
                        <svg class="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Footer -->
            <div class="mt-3 flex gap-2">
              <button
                @click="close"
                class="flex-1 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-lg transition-colors font-medium cursor-pointer"
              >
                取消
              </button>
              <button
                @click="saveSelection"
                :disabled="!selectedServer || saving"
                class="flex-1 px-3 py-1.5 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white text-sm font-bold rounded-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ saving ? '保存中...' : '保存选择' }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { getImageServer, saveImageServer } from '@/utils/imageServer'
import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  withCredentials: true
})

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const authStore = useAuthStore()

const visible = ref(false)
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const servers = ref([])
const selectedServer = ref('')
const testImageUrl = ref('')
const testImageLoading = ref(false)
const testImageLoadTime = ref(null)
const testImageError = ref(false)
const testImageStartTime = ref(0)
const serverLoadTimes = ref({})

// Watch for prop changes
watch(() => props.modelValue, (newVal) => {
  visible.value = newVal
  if (newVal) {
    fetchServers()
  }
})

// Watch for visible changes
watch(visible, (newVal) => {
  emit('update:modelValue', newVal)
})

const fetchServers = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const response = await api.get('/image-servers')
    servers.value = response.data.servers
    
    // Use the utility function to get current server
    selectedServer.value = getImageServer()
    
    // Test the current server immediately
    if (selectedServer.value) {
      testImage(selectedServer.value)
    }
  } catch (err) {
    console.error('Failed to fetch servers:', err)
    error.value = '获取服务器列表失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

const selectServer = (server) => {
  selectedServer.value = server.url
  testImage(server.url)
}

const testImage = (serverUrl) => {
  testImageLoading.value = true
  testImageError.value = false
  testImageLoadTime.value = null
  testImageStartTime.value = Date.now()
  
  // Force reload by adding timestamp
  testImageUrl.value = `${serverUrl}/media/albums/145504_3x4.jpg?t=${Date.now()}`
}

const onTestImageLoad = () => {
  const loadTime = Date.now() - testImageStartTime.value
  testImageLoadTime.value = loadTime
  testImageLoading.value = false
  
  // Store load time for this server
  if (selectedServer.value) {
    serverLoadTimes.value[selectedServer.value] = loadTime
  }
}

const onTestImageError = () => {
  testImageError.value = true
  testImageLoading.value = false
  testImageLoadTime.value = null
  
  // Mark this server as failed
  if (selectedServer.value) {
    serverLoadTimes.value[selectedServer.value] = -1
  }
}

const saveSelection = async () => {
  if (!selectedServer.value || saving.value) return
  
  saving.value = true
  
  try {
    // Use utility function to save
    await saveImageServer(selectedServer.value, api)
    
    close()
    
    // Show success message (optional)
    console.log('Image server updated successfully')
    
    // Reload the page to apply new image server
    window.location.reload()
  } catch (err) {
    console.error('Failed to save server selection:', err)
    error.value = '保存失败，请稍后重试'
  } finally {
    saving.value = false
  }
}

const close = () => {
  visible.value = false
}

onMounted(() => {
  // Initialize selected server using utility function
  selectedServer.value = getImageServer()
})
</script>

<style scoped>
.bg-gray-750 {
  background-color: rgb(40, 40, 47);
}
</style>