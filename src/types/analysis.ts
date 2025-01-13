export type AnalysisType = 'technical' | 'fundamental' | 'sentiment' | 'comparative' | 'news_based' | 'risk';

export const ANALYSIS_OPTIONS = [
  { value: 'technical', label: 'Technical Analysis' },
  { value: 'fundamental', label: 'Fundamental Analysis' },
  { value: 'sentiment', label: 'Sentiment Analysis' },
  { value: 'comparative', label: 'Comparative Analysis' },
  { value: 'news_based', label: 'News Analysis' },
  { value: 'risk', label: 'Risk Analysis' }
] as const;

// Add type for options
export interface AnalysisOption {
  value: AnalysisType;
  label: string;
} 