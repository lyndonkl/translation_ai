import { load } from 'cheerio';
import { TranslatorSubgraphAnnotation } from '../../../state';

export async function combiner(state: typeof TranslatorSubgraphAnnotation.State): Promise<Partial<typeof TranslatorSubgraphAnnotation.State>> {
  const { intermediateTranslation } = state;

  // Return the last refinement as the final translation
  return {
    translation: intermediateTranslation[intermediateTranslation.length - 1],
  };
} 