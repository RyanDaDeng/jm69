import axios from 'axios'

// Use the same axios instance setup
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

// Get VIP plans
export const getVipPlans = async () => {
  const response = await api.get('/api/vip/plans')
  return response.data
}

// Create VIP order
export const createVipOrder = async (planKey, paymentMethod) => {
  const response = await api.post('/api/vip/create-order', {
    plan_key: planKey,
    payment_method: paymentMethod
  })
  return response.data
}