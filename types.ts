export interface PricingRule {
  level: number | string;
  duration: string;
  specs: string;
  priceDiamonds: number;
  priceUsd: number;
  description: string;
}

export interface AnalysisResult {
  estimatedDuration: string;
  screenCoverage: string;
  transitionCount: number;
  visualComplexity: string;
  suggestedLevel: number;
  suggestedPriceUsd: number;
  suggestedDiamonds: number;
  reasoning: string;
  warnings?: string[];
}

export interface FileData {
  file: File;
  previewUrl: string;
  type: 'video' | 'image' | 'unknown';
}

export interface QueueItem extends FileData {
  id: string;
  status: 'idle' | 'analyzing' | 'success' | 'error';
  result?: AnalysisResult;
  errorMsg?: string;
}