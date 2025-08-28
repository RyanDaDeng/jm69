<template>
  <teleport to="body">
    <transition name="fade">
      <div v-if="showWarning" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
        <div class="bg-gray-900 rounded-2xl max-w-md w-full p-6 sm:p-8 border-2 border-red-600 shadow-2xl">
          <!-- Warning Icon -->
          <div class="flex justify-center mb-6">
            <div class="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center animate-pulse">
              <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>

          <!-- Title -->
          <h1 class="text-2xl sm:text-3xl font-bold text-red-500 text-center mb-4">
            成人内容警告
          </h1>

          <!-- Warning Message -->
          <div class="bg-red-900/20 border border-red-800 rounded-lg p-4 mb-6">
            <p class="text-gray-300 text-center leading-relaxed">
              本网站包含成人内容，仅限<span class="text-red-400 font-bold">18岁及以上</span>成年人访问。
            </p>
            <p class="text-gray-300 text-center mt-2 text-sm">
              未成年人请立即离开此网站。
            </p>
          </div>

          <!-- Legal Notice -->
          <div class="text-xs text-gray-500 text-center mb-6 space-y-1">
            <p>访问本站即表示您：</p>
            <ul class="space-y-1">
              <li>• 已年满18周岁并具有完全民事行为能力</li>
              <li>• 同意浏览成人内容</li>
              <li>• 承诺遵守当地相关法律法规</li>
            </ul>
          </div>

          <!-- Buttons -->
          <div class="grid grid-cols-2 gap-4">
            <button
              @click="handleReject"
              class="px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-all cursor-pointer"
            >
              <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              未满18岁
            </button>
            <button
              @click="handleAccept"
              class="px-4 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-medium transition-all cursor-pointer"
            >
              <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              已满18岁
            </button>
          </div>

          <!-- Footer Warning -->
          <p class="text-xs text-gray-600 text-center mt-6">
            请诚实回答，本站将根据您的选择进行处理
          </p>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const showWarning = ref(false)

// Check if user has already confirmed age
onMounted(() => {
  const ageConfirmed = localStorage.getItem('ageConfirmed')
  const confirmTime = localStorage.getItem('ageConfirmTime')
  
  // Check if age was confirmed and if it's still valid (30 days)
  if (ageConfirmed === 'true' && confirmTime) {
    const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000
    const timePassed = Date.now() - parseInt(confirmTime)
    
    if (timePassed < thirtyDaysInMs) {
      // Age confirmation is still valid
      return
    }
  }
  
  // Show warning if not confirmed or expired
  showWarning.value = true
})

// Handle accept (18+)
const handleAccept = () => {
  localStorage.setItem('ageConfirmed', 'true')
  localStorage.setItem('ageConfirmTime', Date.now().toString())
  showWarning.value = false
}

// Handle reject (under 18)
const handleReject = () => {
  // Clear any stored data
  localStorage.removeItem('ageConfirmed')
  localStorage.removeItem('ageConfirmTime')
  
  // Show goodbye message
  alert('本站包含成人内容，未成年人不得访问。即将关闭页面。')
  
  // Try to close the window/tab
  window.close()
  
  // If closing fails (most browsers block it), redirect to a safe site
  setTimeout(() => {
    window.location.href = 'https://www.google.com'
  }, 100)
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>