import axios from 'axios'

// Use the same axios instance setup as auth
const API_URL = import.meta.env.PROD 
  ? import.meta.env.VITE_BACKEND_API_URL 
  : ''

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  withCredentials: true
})

// Get all user's collections
export const getCollections = async (page = 1, perPage = 20) => {
  const response = await api.get('/api/collections', {
    params: { page, per_page: perPage }
  })
  return response.data
}

// Add a comic to collection
export const addToCollection = async (comic) => {
  const response = await api.post('/api/collections', {
    comic_id: comic.id,
    name: comic.name || comic.title,
    author: comic.author || '',
    cover: comic.cover || null
  })
  return response.data
}

// Remove a comic from collection
export const removeFromCollection = async (comicId) => {
  const response = await api.delete(`/api/collections/${comicId}`)
  return response.data
}

// Toggle collection status
export const toggleCollection = async (comic) => {
  const response = await api.post('/api/collections/toggle', {
    comic_id: comic.id,
    name: comic.name || comic.title,
    author: comic.author || '',
    cover: comic.cover || null
  })
  return response.data
}

// Check if a comic is collected
export const checkCollection = async (comicId) => {
  const response = await api.get(`/api/collections/check/${comicId}`)
  return response.data
}

// Get collection stats
export const getCollectionStats = async () => {
  const response = await api.get('/api/collections/stats')
  return response.data
}