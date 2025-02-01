import * as fs from 'fs/promises';
import * as path from 'path';

interface ContentNode {
  _type: string;
  content?: string | ContentNode[];
  attributes?: any;
}

interface ContentJson {
  body: ContentNode[];
}

async function extractTextContent(jsonContent: ContentNode[]): Promise<string> {
  const textParts: string[] = [];
  let currentParagraph: string[] = [];

  function traverse(node: ContentNode | ContentNode[]) {
    if (Array.isArray(node)) {
      node.forEach(n => traverse(n));
      return;
    }

    // If we encounter a paragraph or header tag, join the current paragraph and start a new one
    if (node._type === 'p' || node._type.match(/^h[1-6]$/)) {
      if (currentParagraph.length > 0) {
        textParts.push(currentParagraph.join(' '));
        currentParagraph = [];
      }
    }

    if (node._type === '#text' && typeof node.content === 'string') {
      currentParagraph.push(node.content.trim());
    }
    
    if (Array.isArray(node.content)) {
      node.content.forEach(child => traverse(child));
    }

    // After processing a paragraph or header tag's content, add its text
    if (node._type === 'p' || node._type.match(/^h[1-6]$/)) {
      if (currentParagraph.length > 0) {
        textParts.push(currentParagraph.join(' '));
        currentParagraph = [];
      }
    }
  }

  traverse(jsonContent);

  // Add any remaining text in the current paragraph
  if (currentParagraph.length > 0) {
    textParts.push(currentParagraph.join(' '));
  }
  
  // Filter out empty strings and join with double newlines
  const result = textParts.filter(text => text.length > 0).join('\n\n');
  console.log('Extracted text content:', result); // Debug log
  return result;
}

async function hasContentJson(folderPath: string): Promise<boolean> {
  try {
    const contentPath = path.join(folderPath, 'content.json');
    await fs.access(contentPath);
    return true;
  } catch {
    return false;
  }
}

async function processFolder(folderPath: string) {
  try {
    // First check if content.json exists
    const hasContent = await hasContentJson(folderPath);
    if (!hasContent) {
      console.log(`Skipping ${folderPath} - no content.json found`);
      return;
    }

    const contentPath = path.join(folderPath, 'content.json');
    const inputPath = path.join(folderPath, 'input.txt');

    // Read and parse content.json
    const contentJson = await fs.readFile(contentPath, 'utf-8');
    const parsedJson = JSON.parse(contentJson) as ContentJson;
    
    if (!parsedJson.body || !Array.isArray(parsedJson.body)) {
      console.log(`Warning: Invalid content structure in ${folderPath} - missing body array`);
      return;
    }
    
    // Extract text content from the body array
    const textContent = await extractTextContent(parsedJson.body);
    
    if (!textContent) {
      console.log('Warning: No text content extracted from', folderPath);
      return;
    }

    // Write to input.txt
    await fs.writeFile(inputPath, textContent);
    console.log(`Successfully processed ${folderPath} - Wrote ${textContent.length} characters`);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error processing ${folderPath}: ${error.message}`);
      // Log the full error for debugging
      console.error('Full error:', error);
    }
  }
}

async function main() {
  const testingDir = path.join(__dirname, 'testing');
  
  try {
    const folders = await fs.readdir(testingDir);

    for (const folder of folders) {
      const folderPath = path.join(testingDir, folder);
      const stat = await fs.stat(folderPath);
      
      if (stat.isDirectory()) {
        await processFolder(folderPath);
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error processing folders:', error.message);
    }
  }
}

// Run the script
main().catch(console.error); 