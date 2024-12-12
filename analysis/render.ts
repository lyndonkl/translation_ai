import * as fs from 'fs/promises';
import * as path from 'path';
import { Translation } from '../src/types';

interface TranslationOutput {
  htmlContent: string;
  translatedContent: string;
  translations: Translation[];
}

interface LanguageOutput {
  language: string;
  data: TranslationOutput;
}

async function generateHtml(folderPath: string) {
  const languages = ['spanish', 'arabic', 'vietnamese', 'chinese'];
  const outputs = await Promise.all(
    languages.map(async lang => {
      const content = await fs.readFile(
        path.join(folderPath, `output_${lang}.json`),
        'utf-8'
      );
      return {
        language: lang,
        data: JSON.parse(content) as TranslationOutput
      };
    })
  );

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Translation Review</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        .tooltip {
            visibility: hidden;
            position: absolute;
            z-index: 1;
            max-width: 500px;
        }
        .tooltip-trigger:hover + .tooltip {
            visibility: visible;
        }
        .translation-section {
            display: none;
        }
        .translation-section.active {
            display: block;
        }
    </style>
</head>
<body class="bg-gray-100 p-8">
    <div class="max-w-7xl mx-auto">
        <div class="mb-6">
            <label for="languageSelect" class="block text-sm font-medium text-gray-700">Select Language:</label>
            <select id="languageSelect" class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                ${languages.map(lang => 
                    `<option value="${lang}">${lang.charAt(0).toUpperCase() + lang.slice(1)}</option>`
                ).join('')}
            </select>
        </div>

        ${languages.map(lang => {
            const output = outputs.find(o => o.language === lang)?.data;
            return `
            <div id="${lang}-section" class="translation-section ${lang === 'spanish' ? 'active' : ''} mb-12 bg-white rounded-lg shadow-lg p-6">
                <h2 class="text-2xl font-bold mb-4">English → ${lang.charAt(0).toUpperCase() + lang.slice(1)}</h2>
                <div class="grid grid-cols-2 gap-4">
                    <div class="original">
                        <h3 class="text-lg font-semibold mb-2">Original</h3>
                        <div class="prose">${output?.htmlContent || ''}</div>
                    </div>
                    <div class="translation">
                        <h3 class="text-lg font-semibold mb-2">Translation</h3>
                        <div class="prose">${output?.translatedContent || ''}</div>
                    </div>
                </div>
                <div class="mt-8">
                    <h3 class="text-lg font-semibold mb-2">Translation Details</h3>
                    ${output?.translations.map((t: Translation) => `
                        <div class="mb-4 p-4 bg-gray-50 rounded relative tooltip-trigger">
                            <p class="font-medium">${t.type}: ${t.path}</p>
                            <div class="tooltip bg-white border p-4 rounded shadow-lg">
                                <p class="font-semibold">Original:</p>
                                <p class="mb-2">${t.originalContent}</p>
                                <p class="font-semibold">Translation:</p>
                                <p class="mb-2">${t.translatedContent}</p>
                                ${t.criticism && t.criticism !== 'NONE' ? `
                                    <p class="font-semibold">Criticism:</p>
                                    <p class="mb-2">${t.criticism}</p>
                                ` : ''}
                                ${t.refinements ? `
                                    <p class="font-semibold">Refinements:</p>
                                    <p>${t.refinements}</p>
                                ` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `}).join('')}
    </div>

    <script>
        document.getElementById('languageSelect').addEventListener('change', function(e) {
            // Hide all sections
            document.querySelectorAll('.translation-section').forEach(section => {
                section.classList.remove('active');
            });
            
            // Show selected section
            const selectedLang = this.value;
            document.getElementById(selectedLang + '-section').classList.add('active');
        });
    </script>
</body>
</html>`;

  await fs.writeFile(path.join(folderPath, 'review.html'), html);
}

async function main() {
  const testingDir = path.join(__dirname, 'testing');
  const folders = await fs.readdir(testingDir);

  for (const folder of folders) {
    const folderPath = path.join(testingDir, folder);
    const stat = await fs.stat(folderPath);
    
    if (stat.isDirectory()) {
      await generateHtml(folderPath);
    }
  }
}

main().catch(console.error); 