<template>
  <div class="min-h-screen bg-gray-900 pb-20 sm:pb-0">
    <PageHeader title="个人中心" />
    <!-- Header -->
    <div class="bg-gradient-to-br from-gray-800 to-gray-900 pb-16 pt-6 border-b border-gray-700">
      <div class="container mx-auto px-4">
        
        <!-- User Info Card -->
        <div class="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-700">
          <div class="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <!-- Avatar -->
            <div class="relative">
              <div class="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-pink-600/80 to-pink-700/80 rounded-full flex items-center justify-center text-white font-bold text-2xl sm:text-3xl shadow-lg">
                {{ userInitial }}
              </div>
              <!-- Avatar upload button - temporarily disabled -->
              <!-- <button class="absolute bottom-0 right-0 p-1.5 bg-gray-700 rounded-full shadow-lg hover:bg-gray-600 transition-colors">
                <svg class="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button> -->
            </div>
            
            <!-- User Details -->
            <div class="flex-1 text-center sm:text-left">
              <h2 class="text-xl sm:text-2xl font-bold text-gray-100 mb-1">{{ authStore.user?.name || '用户' }}</h2>
              <p class="text-gray-400 text-sm mb-3">{{ authStore.user?.email }}</p>
              
              <!-- VIP Status -->
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full" 
                :class="isUserVip() ? 'bg-yellow-500/20 text-yellow-300' : 'bg-gray-500/20 text-gray-300'">
                <svg v-if="isUserVip()" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span class="text-sm font-medium">
                  {{ isUserVip() ? 'VIP会员' : '普通用户' }}
                </span>
                <span v-if="isUserVip() && authStore.user?.vip_expired_at" class="text-xs opacity-70">
                  有效期至 {{ formatDate(authStore.user.vip_expired_at) }}
                </span>
              </div>
            </div>
            
            <!-- Action Buttons -->
            <div class="flex gap-2 mt-4 sm:mt-0">
              <button @click="openEditModal" class="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors cursor-pointer">
                <svg class="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button @click="openSettingsModal" class="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors cursor-pointer">
                <svg class="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Menu Options -->
    <div class="container mx-auto px-4 -mt-8">
      <div class="bg-gray-800 rounded-xl overflow-hidden mb-6">
        <div class="divide-y divide-gray-700">
          <!-- Collection -->
          <router-link to="/collection" class="flex items-center justify-between p-4 hover:bg-gray-750 transition-colors cursor-pointer">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-pink-500/20 rounded-lg">
                <svg class="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div class="text-white font-medium">我的收藏</div>
            </div>
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </router-link>
          
          <!-- VIP -->
          <button @click="handleVipClick" class="w-full flex items-center justify-between p-4 hover:bg-gray-750 transition-colors cursor-pointer">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-yellow-500/20 rounded-lg">
                <svg class="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <div class="text-white font-medium">VIP会员</div>
            </div>
            <div class="flex items-center gap-2">
              <span v-if="!isUserVip()" class="text-xs bg-yellow-500 text-white px-2 py-0.5 rounded-full">升级</span>
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
          
          <!-- Recharge History -->
          <button @click="handleRechargeHistory" class="w-full flex items-center justify-between p-4 hover:bg-gray-750 transition-colors cursor-pointer">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-gray-600/20 rounded-lg">
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <div class="text-white font-medium">充值记录</div>
            </div>
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
          
          <!-- Settings -->
          <button @click="openSettingsModal" class="w-full flex items-center justify-between p-4 hover:bg-gray-750 transition-colors cursor-pointer">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-gray-600/20 rounded-lg">
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div class="text-white font-medium">账号设置</div>
            </div>
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
          
          <!-- Contact Us -->
          <button @click="showContactModal = true" class="w-full flex items-center justify-between p-4 hover:bg-gray-750 transition-colors cursor-pointer">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-gray-600/20 rounded-lg">
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div class="text-white font-medium">联系我们</div>
            </div>
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
      
      <!-- Logout Button -->
      <button 
        @click="showLogoutModal = true"
        class="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg font-medium transition-colors"
      >
        退出登录
      </button>
    </div>
    
    <!-- Edit Profile Modal -->
    <ModalDialog
      v-model="showEditModal"
      icon="info"
      title="编辑资料"
      confirm-text="保存"
      cancel-text="取消"
      :close-on-backdrop="false"
      @confirm="handleSaveProfile"
      @cancel="closeEditModal"
    >
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">用户名</label>
          <input 
            v-model="editForm.name"
            type="text" 
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-pink-500"
            placeholder="输入用户名"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">邮箱</label>
          <input 
            v-model="editForm.email"
            type="email" 
            class="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 cursor-not-allowed"
            placeholder="输入邮箱"
            disabled
          />
          <p class="text-xs text-gray-500 mt-1">邮箱暂不支持修改</p>
        </div>
      </div>
    </ModalDialog>
    
    <!-- Settings Modal -->
    <ModalDialog
      v-model="showSettingsModal"
      icon="info"
      title="账号设置"
      :show-confirm="false"
      cancel-text="关闭"
      @cancel="closeSettingsModal"
    >
      <button @click="openPasswordModal" class="w-full text-left p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
        <div class="flex items-center justify-between">
          <span class="text-white">修改密码</span>
          <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </button>
    </ModalDialog>

    <!-- Password Change Modal -->
    <ModalDialog
      v-model="showPasswordModal"
      icon="lock"
      title="修改密码"
      confirm-text="确认修改"
      cancel-text="取消"
      :close-on-backdrop="false"
      @confirm="handleChangePassword"
      @cancel="closePasswordModal"
    >
      <div class="space-y-4">
        <!-- Old Password -->
        <div>
          <label class="block text-gray-300 text-sm mb-1.5">旧密码</label>
          <input
            v-model="passwordForm.old_password"
            type="password"
            placeholder="请输入当前密码"
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:outline-none focus:border-pink-500 transition-colors"
            required
          />
        </div>
        
        <!-- New Password -->
        <div>
          <label class="block text-gray-300 text-sm mb-1.5">新密码</label>
          <input
            v-model="passwordForm.new_password"
            type="password"
            placeholder="请输入新密码（至少8个字符）"
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:outline-none focus:border-pink-500 transition-colors"
            required
            minlength="8"
          />
        </div>
        
        <!-- Confirm New Password -->
        <div>
          <label class="block text-gray-300 text-sm mb-1.5">确认新密码</label>
          <input
            v-model="passwordForm.new_password_confirmation"
            type="password"
            placeholder="请再次输入新密码"
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:outline-none focus:border-pink-500 transition-colors"
            required
            minlength="8"
          />
        </div>
      </div>
    </ModalDialog>

    <!-- Contact Modal -->
    <ModalDialog
      v-model="showContactModal"
      icon="info"
      title="联系我们"
      :show-confirm="false"
      cancel-text="关闭"
      @cancel="showContactModal = false"
    >
      <div class="text-center py-4">
        <div class="mb-4">
          <svg class="w-16 h-16 mx-auto text-blue-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z"/>
          </svg>
        </div>
        <p class="text-gray-300 mb-6">欢迎加入我们的Telegram群组获取支持</p>
        <a 
          href="https://t.me/+frktRDVHynY3OTA1" 
          target="_blank"
          class="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z"/>
          </svg>
          加入Telegram群组
        </a>
      </div>
    </ModalDialog>

    <!-- Logout Confirmation Dialog -->
    <ConfirmationDialog
      v-model="showLogoutModal"
      type="warning"
      title="退出登录"
      message="确定要退出当前账号吗？"
      confirm-text="退出"
      cancel-text="取消"
      confirm-button-class="bg-red-600 hover:bg-red-700 text-white"
      @confirm="handleLogout"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { updateProfile, changePassword } from '@/api/auth'
import { useNotification } from '@/composables/useNotification'
import ModalDialog from '@/components/ModalDialog.vue'
import ConfirmationDialog from '@/components/ConfirmationDialog.vue'
import PageHeader from '@/components/PageHeader.vue'

const router = useRouter()
const authStore = useAuthStore()
const notification = useNotification()

// Modal states
const showEditModal = ref(false)
const showSettingsModal = ref(false)
const showPasswordModal = ref(false)
const showContactModal = ref(false)
const showLogoutModal = ref(false)

// Edit form
const editForm = ref({
  name: '',
  email: ''
})

// Password form
const passwordForm = ref({
  old_password: '',
  new_password: '',
  new_password_confirmation: ''
})

// Computed
const userInitial = computed(() => {
  return authStore.user?.name?.charAt(0).toUpperCase() || 'U'
})

// Helper function to check if user is VIP
const isUserVip = () => {
  if (!authStore.user?.vip_expired_at) return false
  return new Date(authStore.user.vip_expired_at) > new Date()
}

// Methods
const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('zh-CN')
}

const handleVipClick = () => {
  router.push('/vip')
}

const handleRechargeHistory = () => {
  router.push('/recharge-history')
}

// Modal open/close handlers with form reset
const openEditModal = () => {
  // Reset form with current user data
  editForm.value = {
    name: authStore.user?.name || '',
    email: authStore.user?.email || ''
  }
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  // Reset form
  editForm.value = {
    name: '',
    email: ''
  }
}

const openSettingsModal = () => {
  showSettingsModal.value = true
}

const closeSettingsModal = () => {
  showSettingsModal.value = false
}

const openPasswordModal = () => {
  // Close settings modal first
  showSettingsModal.value = false
  // Reset password form
  passwordForm.value = {
    old_password: '',
    new_password: '',
    new_password_confirmation: ''
  }
  showPasswordModal.value = true
}

const closePasswordModal = () => {
  showPasswordModal.value = false
  // Reset form
  passwordForm.value = {
    old_password: '',
    new_password: '',
    new_password_confirmation: ''
  }
}

const handleSaveProfile = async () => {
  try {
    const response = await updateProfile({
      name: editForm.value.name
    })
    
    if (response.success) {
      // Update the auth store with new user data
      authStore.user = response.user
      closeEditModal()
      notification.success('用户名更新成功！')
    }
  } catch (error) {
    console.error('Failed to update profile:', error)
    // Error notification is handled by axios interceptor
    // No need to manually show error here
  }
}

const handleChangePassword = async () => {
  try {
    const response = await changePassword(passwordForm.value)
    
    if (response.success) {
      closePasswordModal()
      notification.success(response.message || '密码修改成功！')
    }
  } catch (error) {
    console.error('Failed to change password:', error)
    // Error notification is handled by axios interceptor
  }
}

const handleLogout = async () => {
  await authStore.logout()
  router.push('/')
}

onMounted(() => {
  // Check if user is logged in
  if (!authStore.isLoggedIn) {
    router.push('/login')
    return
  }
})
</script>