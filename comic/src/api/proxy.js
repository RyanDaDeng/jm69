import axios from 'axios'
import { decryptData } from './crypto'
import { useAppStore } from '@/stores/app'

// 使用与auth.js相同的配置
const API_URL = import.meta.env.PROD 
  ? import.meta.env.VITE_BACKEND_API_URL 
  : ''

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  withCredentials: true
})

// 搜索漫画
export async function getSearchResults(searchQuery, page = 1) {
  const appStore = useAppStore()
  const cleanQuery = searchQuery.replace(/\s/g, '')
  
  const { data } = await api.get('/api/comic/search', {
    params: {
      search_query: cleanQuery,
      o: 'mv',
      page: page
    }
  })
  
  console.log('Raw search response:', data)
  const decrypted = decryptData(appStore.currentKey, data.data)
  console.log('Decrypted search data:', decrypted)
  return decrypted
}

// 获取最新内容
export async function getLatestContent(page = 1) {
  const appStore = useAppStore()
  const { data } = await api.get('/api/comic/latest', {
    params: { page }
  })
  return decryptData(appStore.currentKey, data.data)
}

// 获取推广内容
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
  
  const { data } = await api.get('/api/comic/promote', {
    params: { page: 1 }
  })
  const decrypted = decryptData(appStore.currentKey, data.data)
  
  // Cache for 24 hours
  localStorage.setItem('promotionData', JSON.stringify({
    data: decrypted,
    timestamp: Date.now()
  }))
  
  return decrypted
}

// 获取漫画专辑
export async function getComicAlbum(comicId) {
  const appStore = useAppStore()
  const { data } = await api.get('/api/comic/album', {
    params: { id: comicId }
  })
  return decryptData(appStore.currentKey, data.data)
}

// 获取漫画章节
export async function getComicChapter(comicId) {
  const appStore = useAppStore()
  const { data } = await api.get('/api/comic/chapter', {
    params: { id: comicId }
  })
  return decryptData(appStore.currentKey, data.data)
}

// 获取论坛评论
export async function getForumComments(albumId, page = 1) {
  const appStore = useAppStore()
  const { data } = await api.get('/api/comic/forum', {
    params: {
      page: page,
      mode: 'manhua',
      aid: albumId
    }
  })
  const decrypted = decryptData(appStore.currentKey, data.data)
  return decrypted.list || []
}

// 获取热门标签
export async function getHotTags() {
  const appStore = useAppStore()
  
  // Check cache first
  const cached = localStorage.getItem('hotTagsData')
  if (cached) {
    const { data, timestamp } = JSON.parse(cached)
    if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
      return data
    }
  }
  
  const { data } = await api.get('/api/comic/hottag')
  const decrypted = decryptData(appStore.currentKey, data.data)
  
  // Cache for 24 hours
  localStorage.setItem('hotTagsData', JSON.stringify({
    data: decrypted,
    timestamp: Date.now()
  }))
  
  return decrypted
}

// 获取分类内容
export async function getCatalogContent(mode, page = 1) {
  const appStore = useAppStore()
  const { data } = await api.get('/api/comic/search', {
    params: {
      mode: mode,
      page: page,
      o: 'mv'
    }
  })
  return decryptData(appStore.currentKey, data.data)
}

// 获取随机漫画
export async function getRandomComics() {
  const appStore = useAppStore()
  
  // Check cache first
  const cached = localStorage.getItem('randomComicsData')
  if (cached) {
    const { data, timestamp } = JSON.parse(cached)
    // Cache for 5 minutes
    if (Date.now() - timestamp < 5 * 60 * 1000) {
      return data
    }
  }
  
  const { data } = await api.get('/api/comic/forum', {
    params: { mode: 'random' }
  })
  const decrypted = decryptData(appStore.currentKey, data.data)
  
  // Cache for 5 minutes
  localStorage.setItem('randomComicsData', JSON.stringify({
    data: decrypted,
    timestamp: Date.now()
  }))
  
  return decrypted
}

// 导出所有函数以保持兼容性
export default {
  getSearchResults,
  getLatestContent,
  getPromotionContent,
  getComicAlbum,
  getComicChapter,
  getForumComments,
  getHotTags,
  getCatalogContent,
  getRandomComics
}