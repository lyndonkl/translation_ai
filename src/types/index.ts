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
  translation?: string;
  path: string;
  context?: {
    parentType?: string;
    position: number;
  }
}

export interface IndexToBlockId {
  [key: number]: string;
}