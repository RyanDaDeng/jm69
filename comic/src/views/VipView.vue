<template>
  <div class="min-h-screen bg-gray-900 pb-20 sm:pb-8">
    <PageHeader title="VIP会员" />

    <!-- Main Content -->
    <div class="container mx-auto px-4 py-6">
      <!-- Title Section -->
      <div class="text-center mb-8">
        <h2 class="text-2xl sm:text-3xl font-bold text-pink-500 mb-3" style="text-shadow: 2px 2px 0 rgba(31, 41, 55, 0.8);">
          开通VIP会员
        </h2>
        <p class="text-gray-400 text-sm sm:text-base">解锁全站所有漫画</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center py-20">
        <LoadingSpinner />
      </div>

      <!-- Pricing Cards -->
      <div v-else class="max-w-md mx-auto space-y-4 sm:max-w-3xl sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-4 sm:items-stretch">
        <div 
          v-for="plan in plans" 
          :key="plan.key"
          :class="[
            'relative bg-gray-800 rounded-xl p-4 sm:p-6 border-2 transition-all flex flex-col',
            plan.popular 
              ? 'border-pink-500 shadow-lg shadow-pink-500/20' 
              : 'border-gray-700 hover:border-gray-600'
          ]"
        >
          <!-- Popular Badge -->
          <div v-if="plan.popular" class="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <span class="px-3 py-1 bg-pink-500 text-white text-xs font-bold rounded-full">
              最受欢迎
            </span>
          </div>

          <!-- Plan Content - flex-grow to push button to bottom -->
          <div class="flex flex-col flex-grow text-center">
            <!-- Plan Name -->
            <h3 class="text-xl font-bold text-white mb-2">{{ plan.name }}</h3>
            
            <!-- Duration -->
            <p class="text-gray-400 text-sm mb-4">{{ plan.duration }}{{ plan.duration_unit }}</p>
            
            <!-- Price Section - fixed height -->
            <div class="mb-4">
              <div class="flex items-baseline justify-center gap-1">
                <span class="text-pink-500 text-sm">¥</span>
                <span class="text-pink-500 text-3xl font-bold">{{ plan.price }}</span>
              </div>
              
              <!-- Original Price & Save - fixed height container -->
              <div class="h-10 mt-2">
                <template v-if="plan.original_price">
                  <div class="text-gray-500 text-sm line-through">¥{{ plan.original_price }}</div>
                  <div v-if="plan.save_amount" class="text-green-400 text-xs">
                    节省 ¥{{ plan.save_amount }}
                  </div>
                </template>
              </div>
            </div>
            
            <!-- Feature - flex-grow to push divider down -->
            <div class="flex-grow flex items-center justify-center border-t border-gray-700 py-4">
              <div v-for="feature in plan.features" :key="feature" class="flex items-center justify-center gap-2 text-gray-300 text-sm">
                <svg class="w-4 h-4 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>{{ feature }}</span>
              </div>
            </div>
            
            <!-- Payment Buttons - always at bottom -->
            <div class="space-y-2">
              <button
                @click.stop="handlePurchase(plan, 'alipay')"
                class="w-full py-2 px-4 rounded-lg font-medium transition-all cursor-pointer bg-gray-700 text-white hover:bg-gray-600 border border-gray-600 hover:border-gray-500 flex items-center justify-center gap-2"
              >
                <span class="text-blue-400">支付宝</span>
                支付
              </button>
              <button
                @click.stop="handlePurchase(plan, 'wechat')"
                class="w-full py-2 px-4 rounded-lg font-medium transition-all cursor-pointer bg-gray-700 text-white hover:bg-gray-600 border border-gray-600 hover:border-gray-500 flex items-center justify-center gap-2"
              >
                <span class="text-green-400">微信</span>
                支付
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- FAQ Section -->
      <div class="mt-12 max-w-md mx-auto sm:max-w-2xl">
        <h3 class="text-lg font-semibold text-white mb-4 text-center">常见问题</h3>
        <div class="bg-gray-800 rounded-lg divide-y divide-gray-700">
          <details class="group">
            <summary class="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-750 transition-colors">
              <span class="text-gray-300 text-sm">VIP会员可以看所有漫画吗？</span>
              <svg class="w-5 h-5 text-gray-400 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div class="px-4 pb-4 text-gray-400 text-sm">
              是的，VIP会员可以无限制阅读全站所有漫画内容。
            </div>
          </details>
          
          <details class="group">
            <summary class="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-750 transition-colors">
              <span class="text-gray-300 text-sm">VIP会员到期后会怎样？</span>
              <svg class="w-5 h-5 text-gray-400 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div class="px-4 pb-4 text-gray-400 text-sm">
              到期后将恢复为普通用户，您的收藏记录会保留。
            </div>
          </details>
          
          <details class="group">
            <summary class="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-750 transition-colors">
              <span class="text-gray-300 text-sm">支持哪些支付方式？</span>
              <svg class="w-5 h-5 text-gray-400 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div class="px-4 pb-4 text-gray-400 text-sm">
              目前支持支付宝和微信支付。
            </div>
          </details>
          
          <details class="group">
            <summary class="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-750 transition-colors">
              <span class="text-gray-300 text-sm">在哪里查看支付状态？</span>
              <svg class="w-5 h-5 text-gray-400 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div class="px-4 pb-4 text-gray-400 text-sm">
              您可以在"个人中心" → "充值记录"页面查看所有支付订单的状态。
            </div>
          </details>
          
          <details class="group">
            <summary class="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-750 transition-colors">
              <span class="text-gray-300 text-sm">支付后多久到账？</span>
              <svg class="w-5 h-5 text-gray-400 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div class="px-4 pb-4 text-gray-400 text-sm">
              支付成功后，VIP权益会在十几秒到几分钟内自动到账。如果长时间未到账，请前往"个人中心" → "联系我们"反馈问题。
            </div>
          </details>
        </div>
      </div>

    </div>

    <!-- Login Modal -->
    <ModalDialog
      v-model="showLoginModal"
      icon="lock"
      title="请先登录"
      message="购买VIP会员需要先登录账号"
      confirm-text="立即登录"
      cancel-text="取消"
      @confirm="goToLogin"
      @cancel="showLoginModal = false"
    />

    <!-- Purchase Confirmation Modal -->
    <ConfirmationDialog
      v-model="showPurchaseModal"
      type="info"
      title="确认购买"
      :message="`确认使用${selectedPaymentMethod === 'alipay' ? '支付宝' : '微信'}购买${selectedPlan?.name}（¥${selectedPlan?.price}）？`"
      confirm-text="确认支付"
      cancel-text="取消"
      @confirm="confirmPurchase"
    />
    
    <!-- Payment Processing Modal -->
    <div v-if="processingPayment" class="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div class="bg-gray-800 rounded-xl p-6 border border-gray-700 text-center max-w-sm mx-4">
        <LoadingSpinner size="large" />
        <p class="text-white mt-4 text-lg font-medium">{{ paymentMessage }}</p>
        <p class="text-gray-400 mt-2 text-sm">请稍候，请勿关闭页面...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getVipPlans, createVipOrder } from '@/api/vip'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import ModalDialog from '@/components/ModalDialog.vue'
import ConfirmationDialog from '@/components/ConfirmationDialog.vue'
import PageHeader from '@/components/PageHeader.vue'

const router = useRouter()
const authStore = useAuthStore()

// State
const plans = ref([])
const loading = ref(false)
const showLoginModal = ref(false)
const showPurchaseModal = ref(false)
const selectedPlan = ref(null)
const selectedPaymentMethod = ref(null)
const processingPayment = ref(false)
const paymentMessage = ref('正在创建订单...')

// Load VIP plans
const loadPlans = async () => {
  loading.value = true
  try {
    const response = await getVipPlans()
    if (response.success) {
      plans.value = response.data
    }
  } catch (error) {
    console.error('Failed to load VIP plans:', error)
  } finally {
    loading.value = false
  }
}

// Handle purchase click
const handlePurchase = (plan, paymentMethod) => {
  if (!authStore.isLoggedIn) {
    showLoginModal.value = true
    return
  }
  
  selectedPlan.value = plan
  selectedPaymentMethod.value = paymentMethod
  showPurchaseModal.value = true
}

// Confirm purchase
const confirmPurchase = async () => {
  showPurchaseModal.value = false
  processingPayment.value = true
  paymentMessage.value = '正在创建订单...'
  
  try {
    const response = await createVipOrder(selectedPlan.value.key, selectedPaymentMethod.value)
    if (response.success && response.payment_url) {
      // Show redirect message
      paymentMessage.value = '正在转向支付页面...'
      
      // Small delay to show the message
      setTimeout(() => {
        window.location.href = response.payment_url
      }, 500)
    } else {
      processingPayment.value = false
      alert('订单创建失败，请稍后重试')
    }
  } catch (error) {
    console.error('Failed to create order:', error)
    processingPayment.value = false
    alert('订单创建失败，请稍后重试')
  }
}

// Go to login page
const goToLogin = () => {
  showLoginModal.value = false
  router.push({
    path: '/login',
    query: { redirect: '/vip' }
  })
}

onMounted(() => {
  loadPlans()
})
</script>

<style scoped>
details summary::-webkit-details-marker {
  display: none;
}
</style>