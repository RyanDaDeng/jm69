<template>
  <div class="bg-gray-900 min-h-screen">
    <PageHeader title="测试页面" />
    <div class="container mx-auto px-4 py-6">
      
      <!-- Custom URL Input Section -->
      <div class="mb-6 bg-gray-800 rounded-lg p-4">
        <h2 class="text-lg font-bold text-white mb-3">Custom URL Test</h2>
        <div class="flex flex-col sm:flex-row gap-2">
          <input
            v-model="customUrl"
            type="text"
            placeholder="Enter custom endpoint (e.g., /albums?page=1 or full URL)"
            class="flex-1 px-3 py-2 bg-gray-700 text-white rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
            @keyup.enter="testCustomUrl"
          />
          <button
            @click="testCustomUrl"
            class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Test Custom URL
          </button>
        </div>
        <div class="mt-2 text-xs text-gray-400">
          <p>Examples:</p>
          <ul class="ml-4 space-y-1">
            <li>• /albums?page=1</li>
            <li>• /categories?slug=doujin&page=2</li>
            <li>• /search?query=test</li>
            <li>• https://www.cdnmhwscc.vip/albums?o=mv</li>
          </ul>
        </div>
      </div>

      <div v-if="loading" class="text-white">Loading...</div>
      
      <div v-if="error" class="bg-red-900/20 border border-red-800 rounded p-4 mb-4">
        <p class="text-red-400">Error: {{ error }}</p>
      </div>
      
      <div v-if="rawResponse" class="bg-gray-800 rounded p-4 mb-4">
        <h2 class="text-lg font-bold text-white mb-2">Raw Response:</h2>
        <pre class="text-green-400 text-xs overflow-auto">{{ JSON.stringify(rawResponse, null, 2) }}</pre>
      </div>
      
      <div v-if="decryptedData" class="bg-gray-800 rounded p-4">
        <h2 class="text-lg font-bold text-white mb-2">Decrypted Data:</h2>
        <pre class="text-blue-400 text-xs overflow-auto">{{ JSON.stringify(decryptedData, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAppStore } from '@/stores/app'
import { decryptData } from '@/api/crypto'
import axios from 'axios'
import PageHeader from '@/components/PageHeader.vue'

const appStore = useAppStore()
const loading = ref(false)
const error = ref('')
const rawResponse = ref(null)
const decryptedData = ref(null)
const customUrl = ref('')

// Fixed third-party test server
const TEST_SERVER = 'www.cdnmhwscc.vip'


const testCustomUrl = async () => {
  if (!customUrl.value.trim()) {
    error.value = 'Please enter a URL or endpoint'
    return
  }
  
  loading.value = true
  error.value = ''
  rawResponse.value = null
  decryptedData.value = null
  
  try {
    let url = customUrl.value.trim()
    
    // If it's not a full URL, prepend the test server
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      // Remove leading slash if present
      if (url.startsWith('/')) {
        url = url.substring(1)
      }
      url = `https://${TEST_SERVER}/${url}`
    }
    
    console.log('Testing Custom URL:', url)
    
    // Make request
    const response = await axios.get(url, {
      headers: {
        token: appStore.accessToken.token,
        tokenParam: appStore.accessToken.tokenParam,
      },
      timeout: 30000 // 30 second timeout
    })
    
    rawResponse.value = response.data
    
    // Try to decrypt if data field exists
    if (response.data && response.data.data) {
      try {
        const decrypted = decryptData(appStore.currentKey, response.data.data)
        decryptedData.value = decrypted
        console.log('Decrypted data:', decrypted)
      } catch (decryptError) {
        console.error('Decryption error:', decryptError)
        // Don't set as error, just show raw response
        console.log('Could not decrypt, showing raw response')
      }
    }
  } catch (err) {
    console.error('Request error:', err)
    error.value = err.message
    if (err.response) {
      rawResponse.value = err.response.data
    }
  } finally {
    loading.value = false
  }
}
</script>