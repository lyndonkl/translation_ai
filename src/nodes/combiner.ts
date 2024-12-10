import { load } from 'cheerio';
import { TranslatorStateAnnotation } from '../state';

export async function combineTranslations(state: typeof TranslatorStateAnnotation.State): Promise<Partial<typeof TranslatorStateAnnotation.State>> {
  const { htmlContent, translations, blocks, plainText } = state;

  if (plainText) {
    return {
      translatedContent: translations[0].translatedContent,
      blocks,
      translations,
      htmlContent
    };
  }

  const $ = load(htmlContent);
  
  translations.forEach(translation => {
    const $el = $(translation.path);
    if ($el.length) {
      $el.html(translation.translatedContent);
    } else {
      console.log('Failed to find element:', translation.path);
    }
  });
  
  return {
    translatedContent: $.html(),
    blocks,
    translations,
    htmlContent
  };
} 