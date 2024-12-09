"use client";

import React, { useState, useEffect } from 'react';
import { ANALYSIS_OPTIONS, AnalysisType } from '@/types/analysis';

interface AnalysisResponse {
  technical_indicators?: {
    rsi?: number;
    macd?: any;
    moving_averages?: any;
  };
  fundamental_data?: {
    pe_ratio?: number;
    market_cap?: string;
    revenue_growth?: string;
  };
  price_data?: {
    current_price?: number;
    daily_change?: string;
    volume?: string;
  };
  analysis_summary?: string;
}

function StockAnalysisComponent() {
  const [mounted, setMounted] = useState<boolean>(false);
  const [stockSymbol, setStockSymbol] = useState<string>('');
  const [analysisType, setAnalysisType] = useState<AnalysisType>('technical');
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-gray-50 dark:bg-gray-900" />;
  }

  const formatAnalysisResponse = (data: any): AnalysisResponse => {
    try {
      // If the response is a string, try to parse it as JSON
      const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
      
      // Return structured data if it matches our interface
      if (typeof parsedData === 'object' && parsedData !== null) {
        return parsedData;
      }
      
      // If it's just a string response, wrap it in our interface
      return {
        analysis_summary: typeof data === 'string' ? data : JSON.stringify(data, null, 2)
      };
    } catch (e) {
      console.log('Raw data received:', data);
      // If parsing fails, return the original data as a summary
      return {
        analysis_summary: String(data)
      };
    }
  };

  const handleAnalyze = async () => {
    if (!stockSymbol) {
      setError('Please enter a stock symbol');
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      console.log('Sending request for:', stockSymbol);
      
      const response = await fetch('http://localhost:8000/analyze-stock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          stock_symbol: stockSymbol,
          analysis_type: analysisType
        })
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to fetch stock analysis: ${response.status}`);
      }

      const responseText = await response.text();
      console.log('Raw response text:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
        console.log('Parsed response data:', data);
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        data = { analysis: responseText };
      }

      if (!data || (!data.analysis && data.analysis !== '')) {
        console.error('Invalid response format:', data);
        throw new Error('Response missing analysis data');
      }

      const formattedAnalysis = formatAnalysisResponse(data.analysis);
      console.log('Formatted analysis:', formattedAnalysis);
      setAnalysis(formattedAnalysis);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('Analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatTextWithLinks = (text: string) => {
    // Remove ** and all # characters
    text = text.replace(/\*\*/g, '').replace(/#+/g, '');
    
    // URL regex pattern
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    
    // Split text by URLs and map through parts
    const parts = text.split(urlPattern);
    
    return parts.map((part, index) => {
      if (urlPattern.test(part)) {
        // If part is a URL, render as link
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-600 underline"
          >
            {new URL(part).hostname}
          </a>
        );
      }
      return part;
    });
  };

  const content = (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-xl p-8 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <svg className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            Stock Analysis Tool
          </h1>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <input 
                type="text" 
                value={stockSymbol}
                onChange={(e) => setStockSymbol(e.target.value.toUpperCase())}
                placeholder="Enter Stock Symbol (e.g., NVDA)"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <svg className="absolute right-3 top-3 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          <select 
            value={analysisType}
            onChange={(e) => setAnalysisType(e.target.value as AnalysisType)}
            className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            {ANALYSIS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          
          <button 
            onClick={handleAnalyze}
            disabled={loading}
            className="px-6 py-3 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing...
              </>
            ) : (
              <>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Analyze
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 dark:bg-red-900/50 dark:text-red-200">
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {loading && (
          <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200">
            <div className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing {stockSymbol}...
            </div>
          </div>
        )}

        {analysis && (
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h2 className="text-xl font-semibold">Analysis Results for {stockSymbol}</h2>
            </div>
            
            <div className="prose dark:prose-invert max-w-none">
              {analysis.analysis_summary ? (
                <div className="whitespace-pre-wrap bg-white dark:bg-gray-800 p-4 rounded-lg shadow-inner">
                  {analysis.analysis_summary.split('\n').map((line, index) => {
                    // Check if line is a heading (starts with # or contains : at the end)
                    if (line.startsWith('#') || line.endsWith(':')) {
                      return (
                        <h3 key={index} className="text-2xl font-bold mb-4 text-blue-600 dark:text-blue-400">
                          {line.replace('#', '').trim()}
                        </h3>
                      );
                    }
                    
                    // Check if line is a sub-point (starts with - or *)
                    if (line.trim().startsWith('-') || line.trim().startsWith('*')) {
                      return (
                        <div key={index} className="flex items-start mb-2 ml-4">
                          <span className="mr-2">•</span>
                          <p className="flex-1">
                            {formatTextWithLinks(line.replace(/^[-*]\s*/, ''))}
                          </p>
                        </div>
                      );
                    }

                    // Regular text with link formatting
                    return (
                      <p key={index} className="mb-2">
                        {formatTextWithLinks(line)}
                      </p>
                    );
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analysis.technical_indicators && (
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                      <h3 className="font-semibold text-lg mb-2">Technical Indicators</h3>
                      <pre className="text-sm overflow-auto">{JSON.stringify(analysis.technical_indicators, null, 2)}</pre>
                    </div>
                  )}
                  {analysis.fundamental_data && (
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                      <h3 className="font-semibold text-lg mb-2">Fundamental Data</h3>
                      <pre className="text-sm overflow-auto">{JSON.stringify(analysis.fundamental_data, null, 2)}</pre>
                    </div>
                  )}
                  {analysis.price_data && (
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                      <h3 className="font-semibold text-lg mb-2">Price Data</h3>
                      <pre className="text-sm overflow-auto">{JSON.stringify(analysis.price_data, null, 2)}</pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return content;
}

export { StockAnalysisComponent };
export default StockAnalysisComponent;