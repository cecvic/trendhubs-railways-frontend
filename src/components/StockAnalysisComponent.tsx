"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ANALYSIS_OPTIONS, AnalysisType } from '@/types/analysis';
import { analyzeStock } from '@/utils/api-client';

// Log available analysis options on import
console.log('Available Analysis Options:', ANALYSIS_OPTIONS);

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
    console.log('Component mounted');
  }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-gray-50 dark:bg-gray-900" />;
  }

  const cleanText = (text: string): string => {
    // First remove ** that wrap around words
    const cleanedText = text.replace(/\*\*([^*]+)\*\*/g, '$1');
    
    return cleanedText
      .replace(/\*\*/g, '')     // Remove any remaining **
      .replace(/#+/g, '')       // Remove #
      .replace(/^[-*]\s*/g, '') // Remove bullet points at start
      .trim();
  };

  const formatAnalysisResponse = (data: any): AnalysisResponse => {
    try {
      // Handle null or undefined data
      if (data === null || data === undefined) {
        throw new Error('No analysis data received');
      }

      // If the response is a string, clean and format it
      if (typeof data === 'string') {
        // Clean the entire string first to handle multi-line ** patterns
        const cleanedData = cleanText(data);
        const lines = cleanedData.split('\n')
          .map(line => line.trim())
          .filter(Boolean); // Remove empty lines
        
        return {
          analysis_summary: lines.join('\n')
        };
      }

      // If it's an object, clean all string values
      if (typeof data === 'object') {
        const cleanedData: Record<string, any> = {};
        for (const [key, value] of Object.entries(data)) {
          if (typeof value === 'string') {
            cleanedData[key] = cleanText(value);
          } else if (value === null || value === undefined) {
            cleanedData[key] = ''; // Convert null/undefined to empty string
          } else if (typeof value === 'object') {
            // Recursively clean nested objects
            cleanedData[key] = formatAnalysisResponse(value);
          } else {
            cleanedData[key] = value;
          }
        }
        return cleanedData;
      }

      // For any other type, convert to string
      return {
        analysis_summary: String(data)
      };
    } catch (e) {
      console.error('Error formatting analysis response:', e);
      throw new Error('Failed to format analysis response: ' + (e instanceof Error ? e.message : 'Unknown error'));
    }
  };

  const renderAnalysisSummary = (summary: string) => {
    return summary.split('\n').map((line, index) => {
      // Handle "Running:" lines
      if (line.trim().toLowerCase().startsWith('running:')) {
        return (
          <p key={index} className="text-center italic text-gray-600 dark:text-gray-400 mb-4">
            {line}
          </p>
        );
      }

      // Handle headings (lines ending with ':')
      if (line.trim().endsWith(':')) {
        const headingText = line.replace(/:$/, '').trim();
        return (
          <h3 key={index} className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100 border-b-2 border-blue-500 pb-2">
            {headingText}
          </h3>
        );
      }

      // Handle bullet points
      if (line.trim().startsWith('-')) {
        const bulletText = line.substring(1).trim();
        return (
          <div key={index} className="flex items-start mb-3 ml-6">
            <span className="text-blue-500 mr-3 text-lg">•</span>
            <p className="flex-1 text-gray-700 dark:text-gray-300">
              {bulletText}
            </p>
          </div>
        );
      }

      // Regular text
      if (line.trim()) {
        return (
          <p key={index} className="mb-4 text-gray-600 dark:text-gray-400">
            {line}
          </p>
        );
      }

      return null;
    });
  };

  const handleAnalysisTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as AnalysisType;
    console.log('Analysis type changed to:', newType);
    setAnalysisType(newType);
  };

  const handleAnalyze = async () => {
    console.log('handleAnalyze called with:', {
      stockSymbol,
      analysisType,
      loading,
      error
    });

    if (!stockSymbol) {
      setError('Please enter a stock symbol');
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const params = {
        stock_symbol: stockSymbol,
        analysis_type: analysisType
      };
      console.log('Starting analysis with params:', params);
      
      const response = await analyzeStock(params);
      console.log('Raw API Response:', response);

      // More lenient response validation
      if (response === undefined || response === null) {
        throw new Error('No response data received from server');
      }

      // Handle empty analysis data more gracefully
      if (response.analysis === undefined || response.analysis === null) {
        console.warn('Empty analysis received:', response);
        setAnalysis({ analysis_summary: 'No analysis data available for this request.' });
        return;
      }

      console.log('Formatting analysis response:', response.analysis);
      const formattedAnalysis = formatAnalysisResponse(response.analysis);
      console.log('Formatted analysis result:', formattedAnalysis);
      setAnalysis(formattedAnalysis);
    } catch (err) {
      console.error('Full error object:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during analysis';
      console.error('Setting error message:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatTextWithLinks = (text: string) => {
    // Remove ** characters from text
    text = text.replace(/\*\*/g, '');
    
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
        <div className="flex flex-col items-center gap-6 mb-8">
          <Image
            src="/Trendhubs-full.png"
            alt="Trendhubs Logo"
            width={300}
            height={76}
            priority
            className="dark:filter dark:brightness-200"
          />
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
            onChange={handleAnalysisTypeChange}
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
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h2 className="text-xl font-semibold">Analysis Results for {stockSymbol}</h2>
            </div>
            
            <div className="prose dark:prose-invert max-w-none">
              {analysis.analysis_summary ? (
                <div className="whitespace-pre-wrap">
                  {renderAnalysisSummary(analysis.analysis_summary)}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {analysis.technical_indicators && (
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                      <h3 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100 border-b-2 border-blue-500 pb-2">Technical Indicators</h3>
                      <pre className="text-sm overflow-auto text-gray-700 dark:text-gray-300">{JSON.stringify(analysis.technical_indicators, null, 2)}</pre>
                    </div>
                  )}
                  {analysis.fundamental_data && (
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                      <h3 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100 border-b-2 border-blue-500 pb-2">Fundamental Data</h3>
                      <pre className="text-sm overflow-auto text-gray-700 dark:text-gray-300">{JSON.stringify(analysis.fundamental_data, null, 2)}</pre>
                    </div>
                  )}
                  {analysis.price_data && (
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                      <h3 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100 border-b-2 border-blue-500 pb-2">Price Data</h3>
                      <pre className="text-sm overflow-auto text-gray-700 dark:text-gray-300">{JSON.stringify(analysis.price_data, null, 2)}</pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © {new Date().getFullYear()} Trendhubs™. All rights reserved.
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Powered by Artificial Intelligence | Advanced Stock Analysis
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return content;
}

export { StockAnalysisComponent };
export default StockAnalysisComponent;