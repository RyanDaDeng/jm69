<template>
  <div class="min-h-screen bg-gray-900">
    <PageHeader title="登录" />
    <div class="flex items-center justify-center px-4 py-6">
    <div class="max-w-md w-full space-y-8">
      <!-- Logo and Title -->
      <div class="text-center">
        <h1 class="text-3xl font-bold text-pink-500 mb-2"
            style="font-family: 'Pacifico', 'Dancing Script', fantasy;">
          禁漫社
        </h1>
        <h2 class="text-2xl font-bold text-white">登录账户</h2>
        <p class="mt-2 text-gray-400">
          还没有账户？
          <router-link to="/register" class="text-pink-500 hover:text-pink-400">
            立即注册
          </router-link>
        </p>
      </div>

      <!-- Login Form -->
      <form @submit.prevent="handleLogin" class="mt-8 space-y-6">
        <div class="space-y-4">
          <!-- Email -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-300">
              邮箱地址
            </label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              class="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              placeholder="your@email.com"
            >
            <p v-if="errors.email" class="mt-1 text-sm text-red-400">{{ errors.email[0] }}</p>
          </div>

          <!-- Password -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-300">
              密码
            </label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              required
              class="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              placeholder="••••••••"
            >
            <p v-if="errors.password" class="mt-1 text-sm text-red-400">{{ errors.password[0] }}</p>
          </div>
        </div>

        <!-- Remember Me -->
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <input
              id="remember"
              v-model="form.remember"
              type="checkbox"
              class="h-4 w-4 text-pink-500 focus:ring-pink-500 bg-gray-800 border-gray-700 rounded"
            >
            <label for="remember" class="ml-2 block text-sm text-gray-400">
              记住我
            </label>
          </div>
          
          <div class="text-sm">
            <a href="#" class="text-pink-500 hover:text-pink-400">
              忘记密码？
            </a>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage" class="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded">
          {{ errorMessage }}
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          :disabled="loading"
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="loading" class="flex items-center gap-2">
            <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            登录中...
          </span>
          <span v-else>登录</span>
        </button>

        <!-- Or Divider -->
        <div class="relative mt-6">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-700"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-gray-900 text-gray-400">或者</span>
          </div>
        </div>

        <!-- Back to Home -->
        <div class="text-center">
          <router-link to="/" class="text-gray-400 hover:text-white text-sm">
            返回首页
          </router-link>
        </div>
      </form>
    </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import PageHeader from '@/components/PageHeader.vue'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  email: '',
  password: '',
  remember: false
})

const errors = ref({})
const errorMessage = ref('')
const loading = ref(false)

onMounted(() => {
  // 设置 remember me 状态
  authStore.setRememberMe(form.remember)
})

const handleLogin = async () => {
  loading.value = true
  errors.value = {}
  errorMessage.value = ''
  
  // 更新 remember me 状态
  authStore.setRememberMe(form.remember)
  
  try {
    const result = await authStore.login({
      email: form.email,
      password: form.password,
      remember: form.remember
    })
    
    if (result.success) {
      // 跳转到首页或之前的页面
      const redirect = router.currentRoute.value.query.redirect || '/'
      router.push(redirect)
    } else {
      errorMessage.value = result.message || '登录失败，请检查您的邮箱和密码'
    }
  } catch (error) {
    if (error.errors) {
      errors.value = error.errors
    } else if (error.message) {
      errorMessage.value = error.message
    } else {
      errorMessage.value = '登录失败，请检查您的邮箱和密码'
    }
  } finally {
    loading.value = false
  }
}
</script>