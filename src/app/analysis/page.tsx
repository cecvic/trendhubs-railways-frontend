'use client';

import StockAnalyzer from '@/components/stock-analyzer';

export default function AnalysisPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <StockAnalyzer />
      </div>
    </main>
  );
} 