import React, { useState } from 'react';
import Image from 'next/image';
import Head from 'next/head';
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

function formatTextWithLinks(text: string): React.ReactNode[] {
  // URL regex pattern - matches http/https URLs
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);

  return parts.map((part, index) => {
    if (urlRegex.test(part)) {
      try {
        const url = new URL(part);
        const displayText = url.hostname + url.pathname.replace(/\/$/, '');
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-600 hover:underline"
          >
            {displayText}
          </a>
        );
      } catch {
        return part;
      }
    }
    return part;
  });
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
    <>
      <Head>
        <title>Trendhubs - Stock Analysis</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-8">
          {/* Header with Logo */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Image
                src="/Trendhubs-full.png"
                alt="Trendhubs Logo"
                width={150}
                height={38}
                className="dark:filter dark:brightness-200"
              />
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Stock Analysis
                </h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">
                  Comprehensive market analysis tools
                </p>
              </div>
            </div>
            <button
              onClick={clearResults}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
              disabled={isLoading || results.length === 0}
            >
              Clear Results
            </button>
          </div>

          {/* Search Bar */}
          <div className="space-y-4 sm:space-y-0 sm:flex sm:gap-4 mb-6">
            <div className="flex-1">
              <input
                type="text"
                value={stockSymbol}
                onChange={(e) => setStockSymbol(e.target.value.toUpperCase())}
                placeholder="Enter Stock Symbol (e.g., AAPL)"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm sm:text-base"
              />
            </div>
          </div>

          {/* Analysis Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-4 mb-6">
            {analysisTypes.map(({ type, label, icon }) => (
              <button
                key={type}
                onClick={() => handleAnalysis(type)}
                disabled={isLoading}
                className="flex flex-col items-center justify-center p-3 sm:p-4 text-xs sm:text-sm font-medium rounded-lg bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="h-5 w-5 mb-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                </svg>
                {label}
              </button>
            ))}
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          )}

          {/* Results Display */}
          <div className="space-y-4 sm:space-y-6">
            {results.map((result, index) => (
              <div 
                key={index} 
                className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <svg className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d={analysisTypes.find(a => a.type === result.type)?.icon} 
                    />
                  </svg>
                  <h3 className="text-lg sm:text-xl font-semibold">
                    {analysisTypes.find(a => a.type === result.type)?.label} Results
                  </h3>
                </div>
                {result.error ? (
                  <div className="text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 sm:p-4 rounded-lg text-sm">
                    {result.error}
                  </div>
                ) : (
                  <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="whitespace-pre-wrap text-xs sm:text-sm text-gray-800 dark:text-gray-200 overflow-x-auto">
                      {typeof result.result === 'string' 
                        ? result.result.split('\n').map((line, i) => (
                            <div key={i} className="mb-2">
                              {formatTextWithLinks(line)}
                            </div>
                          ))
                        : JSON.stringify(result.result, null, 2)}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Copyright Footer */}
          <div className="mt-8 sm:mt-12 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              © {new Date().getFullYear()} Trendhubs™. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </>
  );
} 