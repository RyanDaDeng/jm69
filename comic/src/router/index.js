import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/latest',
      name: 'latest',
      component: () => import('../views/LatestView.vue')
    },
    {
      path: '/search',
      name: 'search',
      component: () => import('../views/SearchView.vue')
    },
    {
      path: '/chapter/:id',
      name: 'chapter',
      component: () => import('../views/ChapterView.vue')
    },
    {
      path: '/collection',
      name: 'collection',
      component: () => import('../views/CollectionView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/catalog',
      name: 'catalog',
      component: () => import('../views/CatalogView.vue')
    },
    {
      path: '/updates',
      name: 'updates',
      component: () => import('../views/UpdatesView.vue')
    },
    {
      path: '/albums-test',
      name: 'albums-test',
      component: () => import('../views/AlbumsTestView.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue')
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue')
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/vip',
      name: 'vip',
      component: () => import('../views/VipView.vue')
    },
    {
      path: '/recharge-history',
      name: 'recharge-history',
      component: () => import('../views/RechargeHistoryView.vue'),
      meta: { requiresAuth: true }
    }
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 路由守卫 - 检查需要认证的页面
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // 如果路由需要认证
  if (to.meta.requiresAuth) {
    // 如果还没有初始化认证状态，先初始化
    if (!authStore.authInitialized) {
      await authStore.initAuth()
    }
    
    // 检查是否已登录
    if (authStore.isLoggedIn) {
      next()
    } else {
      // 未登录，重定向到登录页
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
    }
  } else if (to.path === '/login' || to.path === '/register') {
    // 如果已登录，访问登录或注册页面时重定向到首页
    if (!authStore.authInitialized) {
      await authStore.initAuth()
    }
    
    if (authStore.isLoggedIn) {
      next({ path: '/' })
    } else {
      next()
    }
  } else {
    // 不需要认证的页面，直接放行
    next()
  }
})

export default router
