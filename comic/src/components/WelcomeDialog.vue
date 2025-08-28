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
        @click.self="closeAndDontShowAgain"
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
            class="relative bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 p-[2px] rounded-2xl w-full max-w-md"
          >
            <div class="bg-gray-900 rounded-2xl p-6 sm:p-8">
              <!-- Header -->
              <div class="flex items-center justify-between mb-6">
                <SiteLogo size="normal" />
                
                <!-- Close button -->
                <button
                  @click="closeAndDontShowAgain"
                  class="text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <!-- Content -->
              <div class="text-gray-300 space-y-4">
                <p class="text-sm sm:text-base leading-relaxed">
                  感谢来到 <span class="text-pink-400 font-semibold">禁漫社 纯净版</span>
                </p>
                
                <p class="text-sm sm:text-base leading-relaxed">
                  这可能是全网
                </p>
                
                <div class="space-y-2">
                  <div class="flex items-center gap-2">
                    <span class="text-pink-500">✨</span>
                    <span class="text-white font-semibold">【最干净】</span>
                    <span class="text-gray-400 text-sm">无任何弹窗打扰</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-pink-500">🚫</span>
                    <span class="text-white font-semibold">【无广告】</span>
                    <span class="text-gray-400 text-sm">纯净阅读体验</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-pink-500">💎</span>
                    <span class="text-white font-semibold">【体验最好】</span>
                    <span class="text-gray-400 text-sm">流畅丝滑操作</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-pink-500">▶️</span>
                    <span class="text-white font-semibold">【自动播放】</span>
                    <span class="text-gray-400 text-sm">轻松连续观看</span>
                  </div>
                </div>
                
                <p class="text-sm text-gray-400 pt-2">
                  的漫画阅读站，请低调使用哦~ 🤫
                </p>
              </div>
              
              <!-- Actions -->
              <div class="mt-6">
                <button
                  @click="closeAndDontShowAgain"
                  class="w-full px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-semibold rounded-lg transition-all transform hover:scale-105 cursor-pointer"
                >
                  开始探索
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import SiteLogo from './SiteLogo.vue'

const visible = ref(false)

const emit = defineEmits(['close'])

// Check if should show welcome dialog
const checkShouldShow = () => {
  const hasSeenWelcome = localStorage.getItem('hasSeenWelcome')
  if (!hasSeenWelcome) {
    // Show after a short delay for better UX
    setTimeout(() => {
      visible.value = true
    }, 500)
  }
}

const close = () => {
  visible.value = false
  emit('close')
}

const closeAndDontShowAgain = () => {
  localStorage.setItem('hasSeenWelcome', 'true')
  close()
}

onMounted(() => {
  checkShouldShow()
})
</script>