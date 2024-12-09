import type { NextApiRequest, NextApiResponse } from 'next'
import { apiClient } from '@your-app/api'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const response = await apiClient.get('/health')
    return res.status(200).json({ status: 'ok', apiStatus: response.data })
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message })
  }
} 