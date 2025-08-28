import axios from 'axios'
import { decryptData, deobfuscateResponse } from './crypto'
import { useAppStore } from '@/stores/app'

// 使用后端代理服务器
const BACKEND_PROXY = import.meta.env.PROD 
  ? (import.meta.env.VITE_BACKEND_API_URL || '') 
  : ''

/**
 * Process response with google_recaptcha field
 * @param {Object} response - Axios response object
 * @returns {Object} Processed response data
 */
function processProxyResponse(response) {
  const data = response.data
  
  // Check if response has google_recaptcha field (new format)
  if (data && data.google_recaptcha) {
    try {
      // Deobfuscate the outer layer
      const deobfuscated = deobfuscateResponse(data.google_recaptcha)
      // Parse the JSON to get the original {code: ..., data: ...} structure
      const originalData = JSON.parse(deobfuscated)
      // Replace response.data with the deobfuscated data
      response.data = originalData
    } catch (error) {
      console.error('Failed to deobfuscate google_recaptcha:', error)
      throw new Error('Invalid response format')
    }
  }
  
  return response
}

/**
 * Helper function to get proxy data and decrypt it
 * @param {string} url - The API endpoint URL
 * @returns {Object} Decrypted data
 */
async function getProxyData(url) {
  const appStore = useAppStore()
  
  // Make the request
  let response = await api.get(url)
  
  // Process google_recaptcha if present
  response = processProxyResponse(response)
  
  // Use timestamp from header if available (for cached responses)
  const timestamp = response.headers['x-timestamp'] || appStore.currentKey
  
  // Decrypt and return the data
  return decryptData(timestamp, response.data.data)
}

const api = axios.create({
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // 需要带cookie
})

api.interceptors.request.use(config => {
  const appStore = useAppStore()
  // 发送currentKey给后端，让后端使用相同的key生成token
  if (appStore.currentKey) {
    config.headers['X-Client-Key'] = appStore.currentKey
  }
  return config
})

export async function getSearchResults(searchQuery, page = 1) {
  const appStore = useAppStore()
  // Match original format - remove spaces like original does
  const cleanQuery = searchQuery.replace(/\s/g, '')
  const url = `${BACKEND_PROXY}/api/search?search_query=${cleanQuery}&o=mv&page=${page}`
  console.log('Searching URL:', url)
  let response = await api.get(url)
  
  // Process google_recaptcha if present
  response = processProxyResponse(response)
  console.log('Raw search response:', response.data)
  
  // Use timestamp from header if available (for cached responses)
  const timestamp = response.headers['x-timestamp'] || appStore.currentKey
  const decrypted = decryptData(timestamp, response.data.data)
  console.log('Decrypted search data:', decrypted)
  return decrypted
}

export async function getLatestContent(page = 1) {
  return getProxyData(`${BACKEND_PROXY}/api/latest?page=${page}`)
}

export async function getPromotionContent() {
  const appStore = useAppStore()
  
  // Check cache first
  const cached = localStorage.getItem('promotionData')
  if (cached) {
    const { data, timestamp } = JSON.parse(cached)
    if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
      return data
    }
  }
  
  let response = await api.get(
    `${BACKEND_PROXY}/api/promote?page=1`
  )
  
  // Process google_recaptcha if present
  response = processProxyResponse(response)
  
  // Use timestamp from header if available (for cached responses)
  const timestamp = response.headers['x-timestamp'] || appStore.currentKey
  const decrypted = decryptData(timestamp, response.data.data)
  
  // Cache for 24 hours
  localStorage.setItem('promotionData', JSON.stringify({
    data: decrypted,
    timestamp: Date.now()
  }))
  
  return decrypted
}

export async function getComicAlbum(comicId) {
  const appStore = useAppStore()
  console.log('Getting album for comic:', comicId)
  console.log('Current key:', appStore.currentKey)
  
  let response = await api.get(
    `${BACKEND_PROXY}/api/album?id=${comicId}`
  )
  
  // Process google_recaptcha if present
  response = processProxyResponse(response)
  console.log('Raw album response:', response.data)
  
  // 检查响应格式
  if (!response.data.data) {
    console.error('Unexpected response format:', response.data)
    throw new Error('Invalid response format from API')
  }
  
  // Use timestamp from header if available (for cached responses)
  const timestamp = response.headers['x-timestamp'] || appStore.currentKey
  const decrypted = decryptData(timestamp, response.data.data)
  console.log('Decrypted album data:', decrypted)
  
  return decrypted
}

export async function getComicChapter(comicId) {
  const appStore = useAppStore()
  console.log('Getting chapter for comic:', comicId)
  console.log('Current key:', appStore.currentKey)
  
  let response = await api.get(
    `${BACKEND_PROXY}/api/chapter?id=${comicId}`
  )
  
  // Process google_recaptcha if present
  response = processProxyResponse(response)
  console.log('Raw chapter response:', response.data)
  
  // 检查响应格式
  if (!response.data.data) {
    console.error('Unexpected response format:', response.data)
    throw new Error('Invalid response format from API')
  }
  
  // Use timestamp from header if available (for cached responses)
  const timestamp = response.headers['x-timestamp'] || appStore.currentKey
  const decrypted = decryptData(timestamp, response.data.data)
  console.log('Decrypted chapter data:', decrypted)
  
  return decrypted
}

export async function getForumComments(albumId, page = 1) {
  const appStore = useAppStore()
  let response = await api.get(
    `${BACKEND_PROXY}/api/forum?page=${page}&mode=manhua&aid=${albumId}`
  )
  
  // Process google_recaptcha if present
  response = processProxyResponse(response)
  
  // Use timestamp from header if available (for cached responses)
  const timestamp = response.headers['x-timestamp'] || appStore.currentKey
  const decrypted = decryptData(timestamp, response.data.data)
  return decrypted.list || []
}

export async function getHotTags() {
  const appStore = useAppStore()
  
  // Check cache first
  const cached = localStorage.getItem('hotTagsData')
  if (cached) {
    const { data, timestamp } = JSON.parse(cached)
    // Cache for 24 hours
    if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
      return data
    }
  }
  
  let response = await api.get(
    `${BACKEND_PROXY}/api/hot_tags`
  )
  
  // Process google_recaptcha if present
  response = processProxyResponse(response)
  
  // Use timestamp from header if available (for cached responses)
  const timestamp = response.headers['x-timestamp'] || appStore.currentKey
  const hotTags = decryptData(timestamp, response.data.data)
  
  // Cache for 24 hours
  localStorage.setItem('hotTagsData', JSON.stringify({
    data: hotTags,
    timestamp: Date.now()
  }))
  
  return hotTags
}

export async function getCategories() {
  const appStore = useAppStore()
  let response = await api.get(
    `${BACKEND_PROXY}/api/categories`
  )
  
  // Process google_recaptcha if present
  response = processProxyResponse(response)
  
  // Use timestamp from header if available (for cached responses)
  const timestamp = response.headers['x-timestamp'] || appStore.currentKey
  return decryptData(timestamp, response.data.data)
}

export async function getCategoriesFilter(page = 1, order = '', category = '') {
  const appStore = useAppStore()
  
  // Build query parameters
  const params = new URLSearchParams()
  params.append('page', page)
  if (order) params.append('o', order)
  if (category) params.append('c', category)
  
  let response = await api.get(
    `${BACKEND_PROXY}/api/categories/filter?${params.toString()}`
  )
  
  // Process google_recaptcha if present
  response = processProxyResponse(response)
  
  // Use timestamp from header if available (for cached responses)
  const timestamp = response.headers['x-timestamp'] || appStore.currentKey
  return decryptData(timestamp, response.data.data)
}

export async function getSerialization(type = 'all', date = 1, page = 1) {
  const appStore = useAppStore()
  let response = await api.get(
    `${BACKEND_PROXY}/api/serialization?type=${type}&date=${date}&page=${page}`
  )
  
  // Process google_recaptcha if present
  response = processProxyResponse(response)
  
  // Use timestamp from header if available (for cached responses)
  const timestamp = response.headers['x-timestamp'] || appStore.currentKey
  return decryptData(timestamp, response.data.data)
}

export async function getWeeklyUpdates(type = 'all') {
  const appStore = useAppStore()
  let response = await api.get(
    `${BACKEND_PROXY}/api/week/filter?type=${type}`
  )
  
  // Process google_recaptcha if present
  response = processProxyResponse(response)
  
  // Use timestamp from header if available (for cached responses)
  const timestamp = response.headers['x-timestamp'] || appStore.currentKey
  return decryptData(timestamp, response.data.data)
}

