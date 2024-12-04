import { load } from 'cheerio';
import { TranslatorStateAnnotation } from '../state';

export async function combineTranslations(state: typeof TranslatorStateAnnotation.State) {
  const { htmlContent, translations } = state;
  const $ = load(htmlContent);
  
  // Replace each paragraph with its translation
  $('p').each((index, element) => {
    const translation = translations.find(
      (t) => t.paragraphId === state.paragraphs[index]?.id
    );
    if (translation) {
      $(element).text(translation.translatedContent);
    }
  });
  
  return {
    htmlContent: $.html(),
    translations, // Return translations array for reference
    paragraphs: state.paragraphs // Return original paragraphs for reference
  };
} 