import axios from 'axios'
import { useNotificationStore } from '@/stores/notification'

// 开发环境用代理(相对路径)，生产环境用完整URL
const API_URL = import.meta.env.PROD 
  ? import.meta.env.VITE_BACKEND_API_URL 
  : ''

// 简单配置
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  withCredentials: true
})

// 响应拦截器 - 处理401未认证和其他错误
api.interceptors.response.use(
  response => response.data,
  error => {
    const notificationStore = useNotificationStore()
    
    if (error.response) {
      const status = error.response.status
      const data = error.response.data
      
      // Handle 422 Validation Errors
      if (status === 422) {
        if (data.errors) {
          // Show first validation error
          const firstError = Object.values(data.errors)[0]
          const errorMessage = Array.isArray(firstError) ? firstError[0] : firstError
          notificationStore.error(errorMessage, '验证失败')
        } else if (data.message) {
          notificationStore.error(data.message, '验证失败')
        }
      }
      // Handle 500 Server Errors
      else if (status >= 500) {
        notificationStore.error('服务器错误，请稍后重试', '服务器错误')
      }
      // Handle 404 Not Found
      else if (status === 404) {
        notificationStore.error('请求的资源不存在', '未找到')
      }
      // Handle 403 Forbidden
      else if (status === 403) {
        notificationStore.error('您没有权限执行此操作', '权限不足')
      }
      // Handle 401 Unauthorized (but don't show notification for normal auth checks)
      else if (status === 401 && !error.config.url?.includes('/api/user')) {
        // Only show notification for actual unauthorized actions, not auth checks
        if (error.config.method !== 'get') {
          notificationStore.warning('请先登录', '需要登录')
        }
      }
    } else if (error.request) {
      // Request made but no response
      notificationStore.error('网络连接失败，请检查网络', '网络错误')
    } else {
      // Something else happened
      notificationStore.error('请求失败，请稍后重试', '错误')
    }
    
    return Promise.reject(error.response?.data || error)
  }
)

// 注册
export const register = async (data) => {
  await api.get('/sanctum/csrf-cookie')
  const response = await api.post('/api/register', data)  // 使用 /api/register
  return response
}

// 登录
export const login = async (credentials) => {
  await api.get('/sanctum/csrf-cookie')
  const response = await api.post('/api/login', credentials)  // 使用 /api/login
  return response
}

// 退出登录
export const logout = async () => {
  await api.post('/api/logout')
}

// 获取当前用户信息（从服务器）
export const getUser = async () => {
  try {
    const user = await api.get('/api/user')
    return user
  } catch (error) {
    // 对于用户未登录的401错误，这是预期的，静默处理
    if (error?.status === 401 || error?.response?.status === 401) {
      return null
    }
    // 其他错误继续抛出
    throw error
  }
}

// 检查是否有session cookie
export const hasSessionCookie = () => {
  // 只检查 laravel-session (注意是连字符不是下划线)
  // 不检查XSRF-TOKEN，因为它在未登录时也存在
  const cookies = document.cookie
  return cookies.includes('laravel-session')
}

// 检查是否已登录（通过API调用）
export const checkAuth = async () => {
  // 先检查cookie，没有cookie就不用调用API
  if (!hasSessionCookie()) {
    return false
  }
  
  try {
    const user = await getUser()
    return !!user
  } catch {
    return false
  }
}

// 更新用户资料
export const updateProfile = async (data) => {
  const response = await api.put('/api/user/profile', data)
  return response
}

// 修改密码
export const changePassword = async (data) => {
  const response = await api.put('/api/user/password', data)
  return response
}