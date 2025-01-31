export interface TranslationMetadata {
  sourceLanguage: string;
  targetLanguage: string;
}

export interface TranslationOutput {
  input: string;
  finalTranslation: string;
  metadata: {
    sourceLanguage: string;
    targetLanguage: string;
    model: string;
    timestamp: string;
  };
}

export interface TranslationRating {
  sourceSegment: string;
  targetSegment: string;
  lastModified: string;
  ratings: {
    accuracy: number;
    fluency: number;
    style: number;
    consistency: number;
    formatting: number;
    readability: number;
    terminology: number;
  };
  comments?: string;
}

export interface TranslationReview {
  ratings: TranslationRating[];
  lastModified: string;
  sourceText: string;
  translationText: string;
} 