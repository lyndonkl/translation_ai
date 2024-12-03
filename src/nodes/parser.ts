import { load } from 'cheerio';
import { v4 as uuidv4 } from 'uuid';
import { Paragraph } from '../types';
import { TranslatorStateAnnotation } from '../state';

export async function parseContent(state: typeof TranslatorStateAnnotation.State) {
  const { htmlContent, metadata } = state;
  const $ = load(htmlContent);
  
  // Extract text content from paragraphs
  const paragraphs: Paragraph[] = [];
  $('p').each((_, element) => {
    const content = $(element).text().trim();
    if (content) {
      paragraphs.push({
        id: uuidv4(),
        content,
        metadata
      });
    }
  });

  return { paragraphs };
} 