import { useAuthStore } from '@/stores/auth'

/**
 * Get the current image server URL
 * Priority: 
 * 1. User's saved preference (if logged in)
 * 2. localStorage (for non-logged in users or fallback)
 * 3. Default server
 */
export function getImageServer() {
  const authStore = useAuthStore()
  
  // If user is logged in and has img_server set, use it
  if (authStore.isLoggedIn && authStore.user?.img_server) {
    return authStore.user.img_server
  }
  
  // Check localStorage
  const savedServer = localStorage.getItem('img_server')
  if (savedServer) {
    return savedServer
  }
  
  // Default server
  return 'https://cdn-msp.jm18c-twie.club'
}

/**
 * Save image server preference
 * Saves to localStorage for all users
 * If logged in, also saves to backend
 */
export async function saveImageServer(serverUrl, api) {
  const authStore = useAuthStore()
  
  // Always save to localStorage
  localStorage.setItem('img_server', serverUrl)
  
  // If logged in, save to backend
  if (authStore.isLoggedIn && api) {
    try {
      await api.put('/user/image-server', {
        img_server: serverUrl
      })
      
      // Update user data in auth store
      authStore.user.img_server = serverUrl
    } catch (err) {
      console.error('Failed to save server to backend:', err)
      // localStorage save was successful, so don't throw
    }
  }
  
  return serverUrl
}

/**
 * Generate complete image URL
 */
export function generateImageUrl(path) {
  if (!path) return ''
  
  // If already a complete URL, return as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  
  const server = getImageServer()
  
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  
  return `${server}/${cleanPath}`
}