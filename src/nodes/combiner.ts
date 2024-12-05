import { load } from 'cheerio';
import { TranslatorStateAnnotation } from '../state';

export async function combineTranslations(state: typeof TranslatorStateAnnotation.State) {
  const { htmlContent, translations, blocks } = state;
  const $ = load(htmlContent);
  
  translations.forEach(translation => {
    // Find element by stored path
    const $el = $(translation.path);
    if ($el.length) {
      $el.html(translation.translatedContent);
    }
  });
  
  return {
    translatedContent: $.html(),
    blocks,
    translations,
    htmlContent
  };
} 