const englishToArabic = `
- Parentheses for abbreviations and numerals sometimes disrupt formatting.
- Syntax problems in listing conditions/phrases affect clarity.
- With regards to medical terminology, some terms are fully translated, but others are transliterated. Eg. is brochodilators.
- Several instances of incorrect masculine/feminine verb or noun forms.
- Singular symptoms often require a masculine verb form; plural symptoms typically need a feminine form.
- Colloquial or informal English phrases cause meaning loss when translated directly.
`;

const englishToVietnamese = `
- Many sections read as word-for-word renderings, which results in awkward phrasing and lacks smooth flow in Vietnamese.
- While technically “not wrong,” such literal translations often require heavy editing to sound natural.
- Several sentences have grammatical issues or are phrased in a way that isn’t commonly used in Vietnamese.
- Improving sentence flow would help the text read more naturally, especially in formal or technical contexts.
- Some medical or technical terms are translated in one instance but transliterated in another (e.g., “bronchodilators”).
- Maintaining consistent usage for key terms ensures clarity and professionalism.
- Some passages sound like spoken language rather than written, formal Vietnamese (e.g., for articles or pamphlets).
- Replacing overly colloquial phrases with more polished options is recommended for a professional audience.
- In places where direct translations are understandable but sound unnatural, rewriting for clarity and brevity would enhance readability.
- Revising word choices and sentence structure would produce a more professional, cohesive final draft.


Examples of Improved Phrasing

- Replacing “tăng cường” with more context-appropriate terms like “gia tăng.”
- Using “phương pháp thở mím môi” instead of a literal phrase for “pursed lips breathing.”
- Choosing “tiết ra” over “sản xuất” in certain medical contexts.
`;

const englishToSpanish = `
- Mistakes such as missing punctuation or extra words in the English source text are directly reflected in the Spanish translation, reducing clarity and accuracy.
- Phrasing like “you may have experienced exacerbations” tends to produce highly technical Spanish.
- Using simpler English (e.g., “you may have had exacerbations”) results in more straightforward, reader-friendly Spanish.
- Some phrases become unclear or misleading in Spanish (e.g., “powerful stream of medication” → “un potente chorro de medicamento,” which could be taken as a literal water stream).
- Reducing highly metaphorical or overly literal English wording helps avoid such confusion in Spanish.
`;

const englishToChinese = `
- Individual words are translated directly, leading to confusing or nonsensical phrasing in a healthcare context.
- Action-oriented sentences come across as overly forceful or blunt when translated word-for-word.
- Errors in the English source result in similarly disjointed or incomplete Chinese sentences.
`;

export const feedback = {
  'english-to-arabic': englishToArabic,
  'english-to-vietnamese': englishToVietnamese,
  'english-to-spanish': englishToSpanish,
  'english-to-chinese': englishToChinese,
};
