import { translateContent } from '../src';
import * as fs from 'fs/promises';
import * as path from 'path';

const TARGET_LANGUAGES = ['spanish', 'arabic', 'vietnamese', 'chinese'];

async function hasAllOutputFiles(folderPath: string): Promise<boolean> {
  try {
    const files = await fs.readdir(folderPath);
    return TARGET_LANGUAGES.every(lang => 
      files.includes(`output_${lang}.json`)
    );
  } catch (error) {
    return false;
  }
}

async function processFolder(folderPath: string) {
  try {
    // Check if all output files exist
    const hasOutputs = await hasAllOutputFiles(folderPath);
    if (hasOutputs) {
      console.log(`Skipping ${folderPath} - outputs already exist`);
      return;
    }

    const inputPath = path.join(folderPath, 'input.txt');
    const input = await fs.readFile(inputPath, 'utf-8');

    for (const targetLanguage of TARGET_LANGUAGES) {
      console.log(`Translating ${folderPath} to ${targetLanguage}...`);
      
      const metadata = {
        sourceLanguage: 'english',
        targetLanguage
      };

      const result = await translateContent(input, metadata, true);
      
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