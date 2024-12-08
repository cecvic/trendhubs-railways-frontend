"use client";

import React, { useState } from 'react';

const StockAnalysisComponent = () => {
  const [stockSymbol, setStockSymbol] = useState('');
  const [analysisType, setAnalysisType] = useState('technical');
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!stockSymbol) {
      setError('Please enter a stock symbol');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Sending request with data:', {
        stock_symbol: stockSymbol,
        analysis_type: analysisType
      });

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
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        throw new Error('Invalid response format from server');
      }

      console.log('Parsed data:', data);
      
      if (!data || !data.analysis) {
        throw new Error('Response missing analysis data');
      }

      setAnalysis(data.analysis);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('Analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Stock Analysis Tool</h1>
      
      <div className="flex space-x-4 mb-4">
        <input 
          type="text" 
          value={stockSymbol}
          onChange={(e) => setStockSymbol(e.target.value.toUpperCase())}
          placeholder="Enter Stock Symbol (e.g., NVDA)"
          className="flex-grow p-2 border rounded"
        />
        
        <select 
          value={analysisType}
          onChange={(e) => setAnalysisType(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="technical">Technical Analysis</option>
          <option value="fundamental">Fundamental Analysis</option>
        </select>
        
        <button 
          onClick={handleAnalyze}
          disabled={loading}
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Analyzing...' : 'Analyze'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          {error}
        </div>
      )}

      {analysis && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h2 className="text-xl font-semibold mb-2">Analysis Results</h2>
          <div className="whitespace-pre-wrap">
            {typeof analysis === 'string' ? analysis : JSON.stringify(analysis, null, 2)}
          </div>
        </div>
      )}
    </div>
  );
};

export default StockAnalysisComponent;