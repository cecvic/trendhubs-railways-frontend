import axios from 'axios';

// Types for stock analysis
export type AnalysisType = 
  | 'technical'
  | 'fundamental'
  | 'sentiment'
  | 'comparative'
  | 'news_based'
  | 'risk';

interface StockAnalysisRequest {
  stock_symbol: string;
  analysis_type: AnalysisType;
}

interface StockAnalysisResponse {
  stock_symbol: string;
  analysis: string | Record<string, unknown>;
}

interface HealthCheckResponse {
  status: 'healthy';
}

// Create axios instance with configuration
const createApiClient = (baseURL: string) => axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
});

// Client for proxied requests through Vercel
const apiClient = createApiClient('');  // Empty base URL since we're using absolute paths

// Client for direct testing of the backend
export const testApiClient = createApiClient('https://fastapi-backend-production-2f5e.up.railway.app');

// Add request interceptor for error handling
apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API Error Response:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error('API No Response:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('API Request Setup Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Stock analysis methods
export const analyzeStock = async (params: StockAnalysisRequest): Promise<StockAnalysisResponse> => {
  const response = await apiClient.post<StockAnalysisResponse>('/analyze-stock', params);
  return response.data;
};

// Health check method
export const checkHealth = async (): Promise<HealthCheckResponse> => {
  const response = await apiClient.get<HealthCheckResponse>('/health');
  return response.data;
};

// Example usage of different analysis types
export const analyzeStockTechnical = (symbol: string) => 
  analyzeStock({ stock_symbol: symbol, analysis_type: 'technical' });

export const analyzeStockFundamental = (symbol: string) => 
  analyzeStock({ stock_symbol: symbol, analysis_type: 'fundamental' });

export const analyzeStockSentiment = (symbol: string) => 
  analyzeStock({ stock_symbol: symbol, analysis_type: 'sentiment' });

export const analyzeStockComparative = (symbol: string) => 
  analyzeStock({ stock_symbol: symbol, analysis_type: 'comparative' });

export const analyzeStockNews = (symbol: string) => 
  analyzeStock({ stock_symbol: symbol, analysis_type: 'news_based' });

export const analyzeStockRisk = (symbol: string) => 
  analyzeStock({ stock_symbol: symbol, analysis_type: 'risk' });

export default apiClient; 