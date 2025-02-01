import * as fs from 'fs/promises';
import * as path from 'path';
import { spawn } from 'child_process';

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

async function ensureReviewsDir(): Promise<string> {
  const reviewsDir = path.join(__dirname, 'reviews');
  try {
    await fs.mkdir(reviewsDir, { recursive: true });
  } catch (error) {
    // Directory might already exist, that's fine
  }
  return reviewsDir;
}

async function buildUiForTest(testFolder: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const env = { ...process.env, VITE_TEST_FOLDER: testFolder };
    
    const build = spawn('npm', ['run', 'build'], {
      cwd: path.join(__dirname, 'ui'),
      env,
      stdio: 'inherit'
    });

    build.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Build failed for ${testFolder} with code ${code}`));
      }
    });

    build.on('error', (err) => {
      reject(err);
    });
  });
}

async function generateHtml(folderPath: string, reviewsDir: string) {
  // Check for output files first
  const hasOutputs = await hasOutputFiles(folderPath);
  if (!hasOutputs) {
    console.log(`Skipping ${folderPath} - no output files found`);
    return;
  }

  // Get the test folder name and number (e.g., "test1" -> "1")
  const testFolder = path.basename(folderPath);
  const testNumber = testFolder.replace('test', '');
  
  try {
    // Run the UI build for this test folder
    await buildUiForTest(testFolder);
    
    // Copy the built file to the reviews folder with numbered name
    const builtFile = path.join(__dirname, 'dist', 'index.html');
    const targetFile = path.join(reviewsDir, `index${testNumber}.html`);
    await fs.copyFile(builtFile, targetFile);
    
    console.log(`Successfully generated index${testNumber}.html in reviews folder`);
  } catch (error) {
    console.error(`Failed to generate index${testNumber}.html:`, error);
  }
}

async function main() {
  // Ensure reviews directory exists
  const reviewsDir = await ensureReviewsDir();
  
  // Clean up any existing files in reviews directory
  const existingFiles = await fs.readdir(reviewsDir);
  await Promise.all(
    existingFiles.map(file => 
      fs.unlink(path.join(reviewsDir, file))
    )
  );

  const testingDir = path.join(__dirname, 'testing');
  const folders = await fs.readdir(testingDir);

  // Sort folders to ensure consistent numbering
  const testFolders = folders
    .filter(folder => folder.startsWith('test'))
    .sort((a, b) => {
      const numA = parseInt(a.replace('test', ''));
      const numB = parseInt(b.replace('test', ''));
      return numA - numB;
    });

  for (const folder of testFolders) {
    const folderPath = path.join(testingDir, folder);
    const stat = await fs.stat(folderPath);
    
    if (stat.isDirectory()) {
      await generateHtml(folderPath, reviewsDir);
    }
  }

  console.log('All review files have been generated in the reviews folder');
}

main().catch(console.error); 