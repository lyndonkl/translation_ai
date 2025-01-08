import { reviewerSystemPrompt, reviewerUserPrompt } from "./reviewer";
import { refinerSystemPrompt, refinerUserPrompt } from "./refiner";

export const formattingReviwerSystemPrompt = `
You are a specialized editorial reviewer focusing on the Formatting of the translation from {sourceLanguage} to {targetLanguage}.
Evaluate whether the HTML structure (tags, attributes, indentation) and any placeholders (like <SEPERATOR>)
are preserved correctly, and that no formatting errors have been introduced.

${reviewerSystemPrompt('Formatting')}
`;

export const formattingReviwerUserPrompt = `
Evaluate the **Formatting** of the following translation from {sourceLanguage} to {targetLanguage}.
Focus on preserving the original HTML tags, attributes, placeholders, and indentation.

${reviewerUserPrompt('Formatting')}

**Original HTML:**
{originalText}

**Translated HTML:**
{translatedText}
`;

export const formattingRefinerSystemPrompt = `
You are a specialized medical writer tasked with refining the Formatting of translation based on feedback from the reviewer on earlier translations. Your task is to refine the translated HTML
based on the provided Formatting-related feedback, ensuring the final text preserves the original HTML structure, tags, and formatting without introducing errors.

${refinerSystemPrompt('Formatting')}
`;


export const formattingRefinerUserPrompt = `
Refine the following translated HTML for **Formatting**, addressing each listed feedback item.
Correct any errors in HTML tags, attributes, placeholders, or indentation.

**Original HTML:**
{originalText}

**Translated HTML:**
{translatedText}

**Formatting feedback:**
{criticism}

${refinerUserPrompt}
`;