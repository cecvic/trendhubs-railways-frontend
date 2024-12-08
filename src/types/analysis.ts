export type AnalysisType = 'technical' | 'fundamental' | 'sentiment' | 'comprehensive';

export const ANALYSIS_OPTIONS = [
  { value: 'technical', label: 'Technical Analysis' },
  { value: 'fundamental', label: 'Fundamental Analysis' },
  { value: 'sentiment', label: 'Sentiment Analysis' },
  { value: 'comprehensive', label: 'Comprehensive Analysis' }
] as const;

// Add type for options
export interface AnalysisOption {
  value: AnalysisType;
  label: string;
} 