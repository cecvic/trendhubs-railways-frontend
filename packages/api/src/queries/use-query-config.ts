import { QueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        const axiosError = error as AxiosError
        // Don't retry on 404s or auth errors
        if (axiosError.response?.status === 404 || axiosError.response?.status === 401) {
          return false
        }
        return failureCount < 3
      },
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
}) 