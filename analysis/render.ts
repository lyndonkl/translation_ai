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
            right: -20px;
            top: 0;
            z-index: 10;
            width: 300px;
        }
        .paragraph-container {
            position: relative;
        }
        .paragraph-container:hover .tooltip {
            visibility: visible;
        }
        .tooltip-icon {
            position: absolute;
            right: -25px;
            top: 0;
            cursor: pointer;
            color: #6B7280;
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
                <div class="grid grid-cols-2 gap-8">
                    <div class="original space-y-4">
                        <h3 class="text-lg font-semibold mb-2">Original</h3>
                        ${output?.translations.map((t: Translation) => `
                            <div class="paragraph-container prose relative">
                                <div class="tooltip-icon">ℹ️</div>
                                <div class="tooltip bg-white border p-4 rounded shadow-lg">
                                    <div class="font-semibold mb-2">Translation Details:</div>
                                    <div class="text-sm space-y-2">
                                        <p><span class="font-medium">Initial:</span> ${t.translatedContent}</p>
                                        <p><span class="font-medium">Criticism:</span> ${t.criticism || 'NONE'}</p>
                                        ${t.refinements ? `
                                            <p><span class="font-medium">Final:</span> ${t.refinements}</p>
                                        ` : ''}
                                    </div>
                                </div>
                                ${t.originalContent}
                            </div>
                        `).join('')}
                    </div>
                    <div class="translation space-y-4">
                        <h3 class="text-lg font-semibold mb-2">Translation</h3>
                        ${output?.translations.map((t: Translation) => `
                            <div class="prose">
                                ${t.refinements || t.translatedContent}
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `}).join('')}
    </div>

    <script>
        document.getElementById('languageSelect').addEventListener('change', function(e) {
            document.querySelectorAll('.translation-section').forEach(section => {
                section.classList.remove('active');
            });
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