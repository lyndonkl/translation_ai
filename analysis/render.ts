import * as fs from 'fs/promises';
import * as path from 'path';

interface TranslationOutput {
  finalTranslation: string;
  criticisms: string[];
  input: string;
  metadata: {
    sourceLanguage: string;
    targetLanguage: string;
  };
}

interface LanguageOutput {
  language: string;
  data: TranslationOutput;
}

async function hasOutputFiles(folderPath: string): Promise<boolean> {
  try {
    const files = await fs.readdir(folderPath);
    return files.some(file => file.startsWith('output_') && file.endsWith('.json'));
  } catch (error) {
    return false;
  }
}

async function generateHtml(folderPath: string) {
  // Check for output files first
  const hasOutputs = await hasOutputFiles(folderPath);
  if (!hasOutputs) {
    console.log(`Skipping ${folderPath} - no output files found`);
    return;
  }

  const languages = ['spanish', 'arabic', 'vietnamese', 'chinese'];
  const outputs = await Promise.all(
    languages.map(async lang => {
      try {
        const content = await fs.readFile(
          path.join(folderPath, `output_${lang}.json`),
          'utf-8'
        );
        return {
          language: lang,
          data: JSON.parse(content) as TranslationOutput
        };
      } catch (error) {
        console.log(`Warning: Missing output for ${lang} in ${folderPath}`);
        return null;
      }
    })
  );

  // Filter out any null results from missing files
  const validOutputs = outputs.filter((output): output is LanguageOutput => output !== null);
  
  if (validOutputs.length === 0) {
    console.log(`Skipping ${folderPath} - no valid output files`);
    return;
  }

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
            position: fixed;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            z-index: 20;
            width: 800px;
            max-height: 80vh;
            overflow-y: auto;
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 0.5rem;
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
            padding: 2rem;
        }
        .translation-section {
            display: none;
        }
        .translation-section.active {
            display: block;
        }
        .translation-container {
            position: relative;
            margin-bottom: 2rem;
            width: 100%;
        }
        .translation-pair {
            display: grid;
            grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
            gap: 3rem;
            background: #f9fafb;
            padding: 1.5rem;
            border-radius: 0.5rem;
            width: 100%;
        }
        .translation-container:hover .tooltip {
            visibility: visible;
        }
        .tooltip-icon {
            position: absolute;
            right: -2rem;
            top: 50%;
            transform: translateY(-50%);
            cursor: pointer;
            color: #6B7280;
            font-size: 1.25rem;
            background: #f3f4f6;
            padding: 0.5rem;
            border-radius: 50%;
        }
        .criticism-text {
            white-space: pre-wrap;
            line-height: 1.6;
        }
        .section-content {
            background: #f9fafb;
            padding: 1rem;
            border-radius: 0.5rem;
            margin-top: 0.5rem;
        }
    </style>
</head>
<body class="bg-gray-100 p-8">
    <div class="max-w-[1400px] mx-auto">
        <div class="mb-6">
            <label for="languageSelect" class="block text-sm font-medium text-gray-700">Select Language:</label>
            <select id="languageSelect" class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                ${languages.map(lang => 
                    `<option value="${lang}">${lang.charAt(0).toUpperCase() + lang.slice(1)}</option>`
                ).join('')}
            </select>
        </div>

        ${languages.map(lang => {
            const output = validOutputs.find(o => o.language === lang)?.data;
            return `
            <div id="${lang}-section" class="translation-section ${lang === 'spanish' ? 'active' : ''} mb-12 bg-white rounded-lg shadow-lg p-6">
                <h2 class="text-2xl font-bold mb-4">English → ${lang.charAt(0).toUpperCase() + lang.slice(1)}</h2>
                <div class="translation-container">
                    <div class="tooltip-icon">ℹ️</div>
                    <div class="translation-pair">
                        <div class="prose">
                            ${output?.input || ''}
                        </div>
                        <div class="prose">
                            ${output?.finalTranslation || ''}
                        </div>
                    </div>
                    <div class="tooltip">
                        <div class="space-y-4">
                            <div>
                                <h3 class="font-semibold text-lg mb-2">Criticisms</h3>
                                <div class="criticism-text section-content">
                                    ${output?.criticisms?.join('\n\n') || 'NONE'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `}).join('')}
    </div>

    <script>
        // Wait for DOM to be ready
        document.addEventListener('DOMContentLoaded', function() {
            // Show Spanish section by default
            document.querySelector('.translation-section').classList.add('active');
            
            // Handle language selection
            document.getElementById('languageSelect').addEventListener('change', function(e) {
                // Hide all sections
                document.querySelectorAll('.translation-section').forEach(section => {
                    section.classList.remove('active');
                });
                
                // Show selected section
                const selectedLang = this.value;
                document.getElementById(selectedLang + '-section').classList.add('active');
            });
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