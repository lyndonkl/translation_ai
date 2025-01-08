import { reviewerSystemPrompt, reviewerUserPrompt } from "./reviewer";
import { refinerSystemPrompt, refinerUserPrompt } from "./refiner";

export const consistencyReviwerSystemPrompt = `
You are a specialized editorial reviewer focusing on the Consistency of the translation from {sourceLanguage} to {targetLanguage}.
Evaluate whether terms, phrases, or styles are used uniformly throughout the text.

${reviewerSystemPrompt('Consistency')}
`;

export const consistencyReviwerUserPrompt = `
Evaluate the **Consistency** of the following translation from {sourceLanguage} to {targetLanguage}.
Focus on uniformity in repeated terminology, phrasing, and style..

${reviewerUserPrompt('Consistency')}

**Original HTML:**
{originalText}

**Translated HTML:**
{translatedText}
`;

export const consistencyRefinerSystemPrompt = `
You are a specialized medical writer tasked with refining the Consistency of translation based on feedback from the reviewer on earlier translations. Your task is to refine the translated HTML
based on the provided Consistency-related feedback, ensuring that any recurring phrases, technical terms, or style elements remain uniform.

${refinerSystemPrompt('Consistency')}
`;

export const consistencyRefinerUserPrompt = `
Refine the following translated HTML for **Consistency**, addressing each listed feedback item.
Ensure repeated terms, phrases, and style remain uniform throughout.

**Original HTML:**
{originalText}

**Translated HTML:**
{translatedText}

**Consistency feedback:**
{criticism}

${refinerUserPrompt}
`;