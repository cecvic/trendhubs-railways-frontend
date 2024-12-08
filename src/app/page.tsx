'use client';

import dynamic from 'next/dynamic';

const StockAnalysisComponent = dynamic(
  () => import('../components/StockAnalysisComponent'),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    )
  }
);

export default function Page() {
  return <StockAnalysisComponent />;
}