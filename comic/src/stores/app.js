import { defineStore } from 'pinia'
import { generateToken } from '@/api/crypto'

export const useAppStore = defineStore('app', {
  state: () => ({
    serverInfo: {
      // 服务器现在由后端管理
      imgServer: ["cdn-msp.jm18c-twie.club", "cdn-msp.jmapiproxy1.cc", "cdn-msp.jmapiproxy2.cc"]
    },
    selectedImgServer: null,
    currentKey: null,
    accessToken: null,
    searchHistory: [],
    collectedComics: [], // This will be synced with backend
    user: null, // 只在内存中保存，不使用localStorage
    authToken: null // Sanctum不需要token
  }),

  getters: {
    isAuthenticated: (state) => !!state.accessToken,
    isLoggedIn: (state) => !!state.user,
    primaryImgServer: (state) => state.selectedImgServer || state.serverInfo.imgServer[0],
    availableImgServers: (state) => {
      // Return all image servers since we're not checking status
      return state.serverInfo.imgServer
    }
  },

  actions: {
    async initializeApp() {
      this.currentKey = Math.floor(Date.now() / 1000)
      this.accessToken = generateToken(this.currentKey)
      this.loadLocalData()
      this.loadServerSettings()
      // Removed server checking - not needed
    },
    
    loadServerSettings() {
      const savedImgServer = localStorage.getItem('selectedImgServer')
      
      if (savedImgServer && this.serverInfo.imgServer.includes(savedImgServer)) {
        this.selectedImgServer = savedImgServer
      } else {
        // Use first image server as default
        this.selectedImgServer = this.serverInfo.imgServer[0]
      }
    },
    
    setSelectedImgServer(imgServer) {
      this.selectedImgServer = imgServer
      localStorage.setItem('selectedImgServer', imgServer)
    },

    loadLocalData() {
      // Load search history
      const searchHistory = localStorage.getItem('searchHistory')
      if (searchHistory) {
        this.searchHistory = JSON.parse(searchHistory)
      }

      // Collections are now loaded from backend via loadCollections()
    },

    addSearchHistory(query) {
      if (!this.searchHistory.includes(query)) {
        this.searchHistory.unshift(query)
        if (this.searchHistory.length > 10) {
          this.searchHistory.pop()
        }
        localStorage.setItem('searchHistory', JSON.stringify(this.searchHistory))
      }
    },

    clearSearchHistory() {
      this.searchHistory = []
      localStorage.removeItem('searchHistory')
    },

    async toggleCollect(comic) {
      if (!this.isLoggedIn) {
        // Return false to indicate user needs to login
        return { success: false, needLogin: true }
      }
      
      try {
        const { toggleCollection } = await import('@/api/collection')
        const result = await toggleCollection(comic)
        
        // Update local state
        const index = this.collectedComics.findIndex(c => c.comic_id === comic.id)
        if (result.is_collected) {
          // Add to local state if not exists
          if (index === -1) {
            this.collectedComics.push({
              comic_id: comic.id,
              name: comic.name || comic.title,
              author: comic.author || '',
              cover: comic.cover || null,
              created_at: new Date().toISOString()
            })
          }
        } else {
          // Remove from local state
          if (index > -1) {
            this.collectedComics.splice(index, 1)
          }
        }
        
        return { success: true, isCollected: result.is_collected }
      } catch (error) {
        console.error('Toggle collection error:', error)
        return { success: false, error: error.message }
      }
    },

    isCollected(comicId) {
      return this.collectedComics.some(c => c.comic_id === comicId)
    },
    
    async loadCollections() {
      if (!this.isLoggedIn) return
      
      try {
        const { getCollections } = await import('@/api/collection')
        const response = await getCollections(1, 100) // Load up to 100 collections
        this.collectedComics = response.data || []
      } catch (error) {
        console.error('Load collections error:', error)
      }
    },

    refreshToken() {
      this.currentKey = Math.floor(Date.now() / 1000)
      this.accessToken = generateToken(this.currentKey)
    },

    setUser(user) {
      this.user = user
    },

    clearUser() {
      this.user = null
      this.authToken = null
    },

    async fetchUser() {
      try {
        const { getUser } = await import('@/api/auth')
        const user = await getUser()
        if (user) {
          this.setUser(user)
        } else {
          this.clearUser()
        }
        return user
      } catch (error) {
        this.clearUser()
        throw error // 继续抛出错误，让调用者决定如何处理
      }
    }
  }
})