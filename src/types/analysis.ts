export const ANALYSIS_TYPES = {
  TECHNICAL: 'technical',
  FUNDAMENTAL: 'fundamental',
  SENTIMENT: 'sentiment',
  COMPARATIVE: 'comparative',
  NEWS_BASED: 'news_based',
  RISK: 'risk'
} as const;

export type AnalysisType = typeof ANALYSIS_TYPES[keyof typeof ANALYSIS_TYPES];

export interface AnalysisOption {
  value: AnalysisType;
  label: string;
  description: string;
}

export const ANALYSIS_OPTIONS: AnalysisOption[] = [
  {
    value: ANALYSIS_TYPES.TECHNICAL,
    label: 'Technical Analysis',
    description: 'Analyze price patterns and technical indicators'
  },
  {
    value: ANALYSIS_TYPES.FUNDAMENTAL,
    label: 'Fundamental Analysis',
    description: 'Evaluate financial statements and economic indicators'
  },
  {
    value: ANALYSIS_TYPES.SENTIMENT,
    label: 'Sentiment Analysis',
    description: 'Analyze market sentiment and social media trends'
  },
  {
    value: ANALYSIS_TYPES.COMPARATIVE,
    label: 'Comparative Analysis',
    description: 'Compare with sector peers and competitors'
  },
  {
    value: ANALYSIS_TYPES.NEWS_BASED,
    label: 'News Analysis',
    description: 'Analyze recent news and their impact'
  },
  {
    value: ANALYSIS_TYPES.RISK,
    label: 'Risk Analysis',
    description: 'Evaluate volatility and potential risks'
  }
]; 