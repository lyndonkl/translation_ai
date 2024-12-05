import { load } from 'cheerio';
import { TranslatorStateAnnotation } from '../state';

export async function combineTranslations(state: typeof TranslatorStateAnnotation.State) {
  const { htmlContent, translations, blocks } = state;
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