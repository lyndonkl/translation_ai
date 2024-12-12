import { translateContent } from '../src';
import * as fs from 'fs/promises';
import * as path from 'path';

const TARGET_LANGUAGES = ['spanish', 'arabic', 'vietnamese', 'chinese'];

interface TranslationOutput {
  htmlContent: string;
  translatedContent: string;
  translations: Array<{
    blockId: string;
    type: string;
    path: string;
    originalContent: string;
    translatedContent: string;
    criticism?: string;
    refinements?: string;
  }>;
}

async function processFolder(folderPath: string) {
  try {
    const inputPath = path.join(folderPath, 'input.txt');
    const htmlContent = await fs.readFile(inputPath, 'utf-8');

    for (const targetLanguage of TARGET_LANGUAGES) {
      console.log(`Translating ${folderPath} to ${targetLanguage}...`);
      
      const metadata = {
        sourceLanguage: 'english',
        targetLanguage
      };

      const result = await translateContent(htmlContent, metadata, true, false);
      
      // Write output
      const outputFileName = `output_${targetLanguage}.json`;
      await fs.writeFile(
        path.join(folderPath, outputFileName),
        JSON.stringify(result, null, 2)
      );
    }
  } catch (error) {
    console.error(`Error processing ${folderPath}:`, error);
  }
}

async function main() {
  const testingDir = path.join(__dirname, 'testing');
  const folders = await fs.readdir(testingDir);

  for (const folder of folders) {
    const folderPath = path.join(testingDir, folder);
    const stat = await fs.stat(folderPath);
    
    if (stat.isDirectory()) {
      await processFolder(folderPath);
    }
  }
}

main().catch(console.error); 