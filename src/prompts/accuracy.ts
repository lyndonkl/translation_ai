import { reviewerSystemPrompt, reviewerUserPrompt } from "./reviewer";
import { refinerSystemPrompt, refinerUserPrompt } from "./refiner";
export const accuracyReviwerSystemPrompt = `
You are a specialized editorial reviewer focusing on the Accuracy of the translation from {sourceLanguage} to {targetLanguage}.
Evaluate whether the translation faithfully represents the source text without mistranslations, omissions,
untranslated sections, or unjustified additions.

${reviewerSystemPrompt('Accuracy')}
`;

export const accuracyReviwerUserPrompt = `
Evaluate the **Accuracy** of the following translation from {sourceLanguage} to {targetLanguage}.
Focus on ensuring the meaning is faithfully conveyed, with no omissions, additions, mistranslations,
or untranslated text.

${reviewerUserPrompt('Accuracy')}

**Original HTML:**
{originalText}

**Translated HTML:**
{translatedText}
`;


export const accuracyRefinerSystemPrompt = `
You are a specialized medical writer tasked with refining translation Accuracy based on feedback from the reviewer on earlier translations. Your task is to refine the translated HTML
based on the provided Accuracy-related feedback, ensuring the final text accurately reflects the source content.

${refinerSystemPrompt('Accuracy')}
`;

export const accuracyRefinerUserPrompt = `
Refine the following translated HTML for **Accuracy**, addressing each listed feedback item.
Preserve HTML structure, attributes, and placeholders like <SEPERATOR>.

**Original HTML:**
{originalText}

**Translated HTML:**
{translatedText}

**Accuracy feedback:**
{criticism}

${refinerUserPrompt}
`;