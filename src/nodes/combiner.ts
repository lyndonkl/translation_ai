import { load } from 'cheerio';
import { TranslatorStateAnnotation } from '../state';

export async function combineTranslations(state: typeof TranslatorStateAnnotation.State): Promise<Partial<typeof TranslatorStateAnnotation.State>> {
  const { input, blocks, plainText, criticisms, intermediateTranslations, finalTranslation } = state;

  if (plainText) {
    return {
      finalTranslation: finalTranslation,
      blocks,
      input,
      criticisms,
      intermediateTranslations,
    };
  }

  const $ = load(input);
  
  blocks.forEach(block => {
    const $el = $(block.path);
    if ($el.length) {
      $el.html(block.translation ?? "");
    } else {
      console.log('Failed to find element:', block.path);
    }
  });
  
  return {
    finalTranslation: $.html(),
    blocks,
    input,
    criticisms,
    intermediateTranslations
  };
} 