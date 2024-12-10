import { load, CheerioAPI, Cheerio } from 'cheerio';
import { v4 as uuidv4 } from 'uuid';
import { TranslationBlock } from '../types';
import { TranslatorStateAnnotation } from '../state';

const TRANSLATABLE_SELECTORS = [
    'h1, h2, h3, h4, h5, h6',
    'p',
    'div:not(:has(p, div, h1, h2, h3, h4, h5, h6))',  // Only divs with direct text
    'blockquote',
    'ul, ol',  // Lists as units
    'dl',      // Definition lists
    'figcaption',
    'button',
    'label'
].join(', ');

export async function parseContent(state: typeof TranslatorStateAnnotation.State): Promise<Partial<typeof TranslatorStateAnnotation.State>> {
    const { htmlContent, metadata } = state;
    const $ = load(htmlContent);
    const blocks: TranslationBlock[] = [];

    $(TRANSLATABLE_SELECTORS).each((index, element) => {
        const $el = $(element);
        
        // Skip hidden elements
        if ($el.css('display') === 'none' || $el.css('visibility') === 'hidden') {
            return;
        }

        const content = $el.html()?.trim();
        if (!content) return;

        blocks.push({
            id: uuidv4(),
            type: $el.prop('tagName')!.toLowerCase(),
            content,
            path: getElementPath($, $el),
            metadata,
            context: {
                parentType: $el.parent().prop('tagName')?.toLowerCase(),
                position: index
            }
        });
    });

    return {
        blocks
    };
}

function getElementPath($: CheerioAPI, $element: Cheerio<any>): string {
    const path: string[] = [];
    let $current = $element;
    
    while ($current.length) {
        const tag = $current.prop('tagName')!.toLowerCase();
        const index = $current.index();
        const selector = $current.siblings(tag).length > 0 ? 
            `${tag}:nth-child(${index + 1})` : 
            tag;
        path.unshift(selector);
        $current = $current.parent();
    }
    
    return path.join(' > ');
} 