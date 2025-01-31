import * as fs from 'fs';
import * as path from 'path';

const sourceDir = path.join(__dirname, '../../testing');
const destDir = path.join(__dirname, '../dist');

// Create dist directory if it doesn't exist
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

// Copy all translation files
function copyTranslationFiles(dir: string) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(dir, entry.name);
    const destPath = path.join(destDir, entry.name);

    if (entry.isDirectory()) {
      copyTranslationFiles(sourcePath);
    } else if (entry.name.endsWith('.json')) {
      fs.copyFileSync(sourcePath, destPath);
    }
  }
}

copyTranslationFiles(sourceDir); 