import axios from 'axios'

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add request interceptor to handle CORS and authentication
apiClient.interceptors.request.use((config) => {
  // Ensure headers exist
  config.headers = config.headers || {}
  
  // Add any auth tokens if needed
  const token = localStorage.getItem('auth_token') || ''
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  
  return config
}) 