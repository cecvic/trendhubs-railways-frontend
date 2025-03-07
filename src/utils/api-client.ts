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
const apiClient = axios.create({
  baseURL: '',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false,
  timeout: 60000,
});

// Add request interceptor for error handling
apiClient.interceptors.request.use(
  (config) => {
    // Add timestamp to avoid caching
    config.params = { 
      ...config.params,
      _t: new Date().getTime()
    };
    
    console.log('API Request Details:', {
      url: config.url,
      method: config.method,
      data: config.data,
      headers: config.headers,
      baseURL: config.baseURL,
      params: config.params
    });
    return config;
  },
  (error) => {
    console.error('API Request Setup Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log('API Response Success:', {
      status: response.status,
      data: response.data,
      headers: response.headers
    });
    
    // Validate response data
    if (response.data === undefined) {
      throw new Error('Invalid response format: missing data');
    }
    
    return response;
  },
  (error) => {
    if (error.response) {
      console.error('API Error Response Details:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
        config: {
          url: error.response.config.url,
          method: error.response.config.method,
          data: error.response.config.data
        }
      });
      // Throw a more informative error message
      if (error.response.data?.detail) {
        throw new Error(error.response.data.detail);
      }
    } else if (error.request) {
      console.error('API No Response Error:', {
        request: error.request,
        config: error.config
      });
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timed out. The server is taking too long to respond.');
      }
      throw new Error('No response received from server. Please check if the backend is running.');
    } else {
      console.error('API Request Setup Error:', {
        message: error.message,
        config: error.config
      });
    }
    return Promise.reject(error);
  }
);

// Stock analysis methods
export const analyzeStock = async (params: StockAnalysisRequest): Promise<StockAnalysisResponse> => {
  const response = await apiClient.post<StockAnalysisResponse>('/api/analyze-stock', params);
  return response.data;
};

// Health check method
export const checkHealth = async (): Promise<HealthCheckResponse> => {
  const response = await apiClient.get<HealthCheckResponse>('/api/health');
  return response.data;
};

export default apiClient; 