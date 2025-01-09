import { reviewerSystemPrompt, reviewerUserPrompt } from "./reviewer";
import { refinerSystemPrompt, refinerUserPrompt } from "./refiner";

export const readabilityReviwerSystemPrompt = `
You are a specialized editorial reviewer focusing on the Readability of the translation from {sourceLanguage} to {targetLanguage}.
Evaluate how clear, coherent, and naturally flowing the translation is.

${reviewerSystemPrompt('Readability')}
`;

export const readabilityReviwerUserPrompt = `
Evaluate the **Readability** of the following translation from {sourceLanguage} to {targetLanguage}.
Focus on clarity, coherence, and natural flow while respecting any formal/technical requirements.

${reviewerUserPrompt('Readability')}

**Original HTML:**
{originalText}

**Translated HTML:**
{translatedText}
`;

export const readabilityRefinerSystemPrompt = `
You are a specialized medical writer tasked with refining the Readability of translation based on feedback from the reviewer on earlier translations. Your task is to refine the translated HTML
based on the provided Readability-related feedback, ensuring a clear, natural flow.

${refinerSystemPrompt('Readability')}
`;

export const readabilityRefinerUserPrompt = `
Refine the following translated HTML for **Readability**, addressing each listed feedback item.
Preserve HTML structure, attributes, and placeholders like <SEPERATOR>.

**Original HTML:**
{originalText}

**Translated HTML:**
{translatedText}

**Readability feedback:**
{criticism}

${refinerUserPrompt}
`;