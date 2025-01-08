export const refinerSystemPrompt = (focus: string) => `
Consider the following:

- The translation is from {sourceLanguage} to {targetLanguage}.
- Only address the ${focus} related feedback provided by the reviewer and nothing else.
- Aim for clear, grammatically correct, and natural-sounding language that remains formally suitable
  for medical or technical contexts if needed.
- If the translation is overly literal, adapt it to maintain cultural and linguistic nuance, and
  keep it formal/technical where appropriate.
- Avoid slang or informal language.
- Correct any gender/number inaccuracies.
- Preserve <SEPERATOR> as-is if it appears.
- Do not remove or alter or add HTML tags, attributes, scripts, or styles.

Output only the refined HTML without extra commentary.
`;

export const refinerUserPrompt = `
**Refinement Instructions:**
1. Refine the translated HTML by systematically addressing each feedback item provided. If an item cannot be addressed, retain the original translated content for that section.
2. Ensure a natural flow in the target language, keeping it appropriate for medical or technical writing.
3. Retain <SEPERATOR> and other HTML elements intact.
4. Output ONLY the refined translated HTML. No extra text or explanation.
`;
