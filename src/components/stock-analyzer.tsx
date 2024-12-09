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

  const analysisTypes: { type: AnalysisType; label: string; handler: (symbol: string) => Promise<any> }[] = [
    { type: 'technical', label: 'Technical Analysis', handler: analyzeStockTechnical },
    { type: 'fundamental', label: 'Fundamental Analysis', handler: analyzeStockFundamental },
    { type: 'sentiment', label: 'Sentiment Analysis', handler: analyzeStockSentiment },
    { type: 'comparative', label: 'Comparative Analysis', handler: analyzeStockComparative },
    { type: 'news_based', label: 'News Analysis', handler: analyzeStockNews },
    { type: 'risk', label: 'Risk Analysis', handler: analyzeStockRisk },
  ];

  const handleAnalysis = async (type: AnalysisType) => {
    if (!stockSymbol) {
      setError('Please enter a stock symbol');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Check API health first
      const health = await checkHealth();
      if (health.status !== 'healthy') {
        throw new Error('API is not responding');
      }

      // Find the analysis handler
      const analysisHandler = analysisTypes.find(a => a.type === type)?.handler;
      if (!analysisHandler) {
        throw new Error('Invalid analysis type');
      }

      // Perform the analysis
      const response = await analysisHandler(stockSymbol);
      
      // Add result to the list
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
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-4">Stock Analysis Tool</h1>
        
        {/* Input Section */}
        <div className="flex gap-4 mb-6">
          <input
            type="text"
            value={stockSymbol}
            onChange={(e) => setStockSymbol(e.target.value.toUpperCase())}
            placeholder="Enter stock symbol (e.g., AAPL)"
            className="flex-1 p-2 border rounded"
            disabled={isLoading}
          />
          <button
            onClick={clearResults}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            disabled={isLoading || results.length === 0}
          >
            Clear Results
          </button>
        </div>

        {/* Analysis Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {analysisTypes.map(({ type, label }) => (
            <button
              key={type}
              onClick={() => handleAnalysis(type)}
              disabled={isLoading}
              className={`p-2 rounded ${
                isLoading 
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Analyzing {stockSymbol}...</p>
          </div>
        )}

        {/* Results Display */}
        <div className="space-y-4">
          {results.map((result, index) => (
            <div key={index} className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">
                {analysisTypes.find(a => a.type === result.type)?.label} Results
              </h3>
              {result.error ? (
                <p className="text-red-600">{result.error}</p>
              ) : (
                <pre className="whitespace-pre-wrap bg-gray-50 p-3 rounded">
                  {typeof result.result === 'string' 
                    ? result.result 
                    : JSON.stringify(result.result, null, 2)}
                </pre>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 