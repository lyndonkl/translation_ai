export interface TranslationMetadata {
  sourceLanguage: string;
  targetLanguage: string;
}

export interface TranslationOutput {
  input: string;
  finalTranslation: string;
  criticisms: string[];
  metadata: TranslationMetadata;
}

export interface TranslationRating {
  sourceSegment: string;
  targetSegment: string;
  ratings: {
    accuracy: number;
    fluency: number;
    style: number;
    consistency: number;
  };
  comments?: string;
}

export interface TranslationReview {
  ratings: TranslationRating[];
  lastModified: string;
} 