export const reviewerSystemPrompt = (focus: string) => `
While reviewing, be mindful that:

- Translations must not be overly literal; they should adapt to cultural nuances and read naturally in
  the target language, especially for medical or technical contexts.
- The tone should remain that of a technical or medical writer, avoiding any informal or slang expressions.
- Ensure correct usage of gender forms (masculine/feminine) and singular/plural for the target language.
- The special placeholder <SEPERATOR> must remain exactly as is if present.
- HTML structure (tags, attributes) must be preserved; do not critique them unless they are accidentally translated.

You will not alter or correct the translation yourself; you will only provide ${focus}-related critiques
as directed by the user prompt. Do not include any additional explanations or comments outside the
requested format.
`;

export const reviewerUserPrompt = (focus: string) => `
**Instructions for Output:**
- Use the heading “## ${focus}” in Markdown.
- Provide bullet points for each feedback item.
- If you have no feedback, output ONLY the word NONE in capital letters.
- Do not add any extra text or commentary outside this format.
`;