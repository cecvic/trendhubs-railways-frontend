import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../utils/api-client';
import axios from 'axios';

interface StockAnalysisProps {
  symbol: string;
  analysisType: string;
}

export function StockAnalysis({ symbol, analysisType }: StockAnalysisProps) {
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['stockAnalysis', symbol, analysisType],
    queryFn: async () => {
      try {
        const response = await apiClient.get(`/analysis/${symbol}`, {
          params: { type: analysisType },
        });
        return response.data;
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setError(err.message);
          throw new Error(`Failed to fetch stock data: ${err.message}`);
        }
        throw err;
      }
    },
    retry: 1,
  });

  if (isLoading) return <div>Loading...</div>;
  
  if (isError || error) {
    return (
      <div className="bg-red-900/50 text-red-100 p-4 rounded-lg">
        <span className="flex items-center gap-2">
          ❌ {error || 'NetworkError when attempting to fetch resource.'}
        </span>
      </div>
    );
  }

  return (
    <div>
      {/* Render your analysis data here */}
    </div>
  );
} 