<template>
  <footer class="bg-gray-900 border-t border-gray-800">
    <div class="container mx-auto px-4 py-8">
      <!-- Age Warning -->
      <div class="bg-red-900/20 border border-red-800 rounded-lg p-4 mb-6">
        <div class="flex items-center gap-3 mb-2">
          <svg class="w-6 h-6 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
          </svg>
          <h3 class="text-lg font-bold text-red-400">成人内容警告</h3>
        </div>
        <p class="text-sm text-gray-300 leading-relaxed">
          本站包含成人内容，仅限18岁及以上成年人访问。未成年人请立即离开。访问本站即表示您已年满18岁并同意浏览成人内容。
        </p>
      </div>
      
      <!-- Disclaimer -->
      <div class="bg-gray-800 rounded-lg p-4 mb-6">
        <h3 class="text-lg font-bold text-white mb-3">免责声明</h3>
        <div class="space-y-2 text-sm text-gray-400 leading-relaxed">
          <p>
            1. 本站所有漫画内容均来源于互联网公开资源的自动搜集与整理，本站不参与任何内容的制作、上传或存储。
          </p>
          <p>
            2. 本站仅提供网络资源的搜索和浏览服务，所有内容的版权归原作者及发布平台所有。
          </p>
          <p>
            3. 如果您发现本站展示的内容侵犯了您的合法权益，请及时联系我们，我们将在收到通知后立即移除相关内容。
          </p>
          <p>
            4. 本站不承担用户因使用本站而产生的任何法律责任。使用本站即表示您同意并接受本免责声明的所有条款。
          </p>
        </div>
      </div>
      
      <!-- Copyright -->
      <div class="text-center pt-4 border-t border-gray-800">
        <div class="flex items-center justify-center space-x-2 mb-2">
          <img 
            src="/logo.png" 
            alt="禁漫社" 
            class="w-6 h-6 object-contain"
          />
          <span class="text-sm text-gray-500 font-semibold">禁漫社</span>
        </div>
        <p class="text-sm text-gray-500">
          © {{ currentYear }} 禁漫社 - 仅供学习交流使用
        </p>
        <p class="text-xs text-gray-600 mt-2">
          本站不存储任何资源内容，所有内容均来自第三方网站
        </p>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'

const currentYear = computed(() => new Date().getFullYear())
</script>