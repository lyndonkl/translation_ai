import { BaseMessage } from "@langchain/core/messages";

export interface TranslationMetadata {
  sourceLanguage: string;
  targetLanguage: string;
  domain?: string;
  style?: string;
}

export interface Paragraph {
  id: string;
  content: string;
  metadata: TranslationMetadata;
}

export interface Translation {
  paragraphId: string;
  originalContent: string;
  translatedContent: string;
  criticism?: string;
  refinements?: string[];
}