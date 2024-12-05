import { BaseMessage } from "@langchain/core/messages";

export interface TranslationMetadata {
  sourceLanguage: string;
  targetLanguage: string;
  domain?: string;
  style?: string;
}

export interface TranslationBlock {
  id: string;
  type: string;
  content: string;
  path: string;
  metadata: TranslationMetadata;
  context?: {
    parentType?: string;
    position: number;
  }
}

export interface Translation {
  blockId: string;
  type: string;
  path: string;
  originalContent: string;
  translatedContent: string;
  criticism?: string;
  refinements?: string;
}