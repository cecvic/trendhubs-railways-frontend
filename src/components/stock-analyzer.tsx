import React, { useState } from 'react';
import {
  analyzeStockTechnical,
  analyzeStockFundamental,
  analyzeStockSentiment,
  analyzeStockComparative,
  analyzeStockNews,
  analyzeStockRisk,
  AnalysisType,
  checkHealth,
} from '@/utils/api-client';

interface AnalysisResult {
  type: AnalysisType;
  result: string | Record<string, unknown>;
  error?: string;
}

export default function StockAnalyzer() {
  const [stockSymbol, setStockSymbol] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const analysisTypes: { type: AnalysisType; label: string; handler: (symbol: string) => Promise<any>; icon: string }[] = [
    { 
      type: 'technical', 
      label: 'Technical Analysis', 
      handler: analyzeStockTechnical,
      icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
    },
    { 
      type: 'fundamental', 
      label: 'Fundamental Analysis', 
      handler: analyzeStockFundamental,
      icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z'
    },
    { 
      type: 'sentiment', 
      label: 'Sentiment Analysis', 
      handler: analyzeStockSentiment,
      icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
    },
    { 
      type: 'comparative', 
      label: 'Comparative Analysis', 
      handler: analyzeStockComparative,
      icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4'
    },
    { 
      type: 'news_based', 
      label: 'News Analysis', 
      handler: analyzeStockNews,
      icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z'
    },
    { 
      type: 'risk', 
      label: 'Risk Analysis', 
      handler: analyzeStockRisk,
      icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
    },
  ];

  const handleAnalysis = async (type: AnalysisType) => {
    if (!stockSymbol) {
      setError('Please enter a stock symbol');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const health = await checkHealth();
      if (health.status !== 'healthy') {
        throw new Error('API is not responding');
      }

      const analysisHandler = analysisTypes.find(a => a.type === type)?.handler;
      if (!analysisHandler) {
        throw new Error('Invalid analysis type');
      }

      const response = await analysisHandler(stockSymbol);
      
      setResults(prev => [{
        type,
        result: response.analysis
      }, ...prev]);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setResults(prev => [{
        type,
        result: '',
        error: err instanceof Error ? err.message : 'Analysis failed'
      }, ...prev]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
    setError(null);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Stock Analysis Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Comprehensive market analysis tools for informed trading decisions
            </p>
          </div>
          <button
            onClick={clearResults}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
            disabled={isLoading || results.length === 0}
          >
            Clear Results
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={stockSymbol}
            onChange={(e) => setStockSymbol(e.target.value.toUpperCase())}
            placeholder="Enter stock symbol (e.g., AAPL)"
            className="w-full pl-10 pr-4 py-3 text-lg border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors duration-200"
            disabled={isLoading}
          />
        </div>

        {/* Analysis Options */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {analysisTypes.map(({ type, label, icon }) => (
            <button
              key={type}
              onClick={() => handleAnalysis(type)}
              disabled={isLoading}
              className={`
                flex items-center justify-center gap-3 p-4 rounded-xl text-left transition-all duration-200
                ${isLoading 
                  ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed opacity-50'
                  : 'bg-white dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:shadow-md border border-gray-200 dark:border-gray-600'
                }
              `}
            >
              <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
              </svg>
              <span className="font-medium">{label}</span>
            </button>
          ))}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-r-xl">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center justify-center gap-3 py-8 text-blue-600 dark:text-blue-400">
            <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-lg font-medium">Analyzing {stockSymbol}...</span>
          </div>
        )}

        {/* Results Display */}
        <div className="space-y-6">
          {results.map((result, index) => (
            <div 
              key={index} 
              className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center gap-3 mb-4">
                <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d={analysisTypes.find(a => a.type === result.type)?.icon} 
                  />
                </svg>
                <h3 className="text-xl font-semibold">
                  {analysisTypes.find(a => a.type === result.type)?.label} Results
                </h3>
              </div>
              {result.error ? (
                <div className="text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                  {result.error}
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200">
                    {typeof result.result === 'string' 
                      ? result.result 
                      : JSON.stringify(result.result, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 