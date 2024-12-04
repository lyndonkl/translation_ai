# Translator Graph

A multi-agent translation system built with LangGraph and TypeScript.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   export OPENAI_API_KEY=your_api_key_here
   ```

3. Build the project:
   ```bash
   npm run build
   ```

## Testing

To test the translation system:

```typescript
import { translateContent } from 'translator-graph';

const htmlContent = `
  <article>
    <p>Hello world!</p>
    <p>This is a test.</p>
  </article>
`;

const metadata = {
  sourceLanguage: 'en',
  targetLanguage: 'es',
  domain: 'general',
};

async function test() {
  const result = await translateContent(htmlContent, metadata);
  console.log(result);
}

test();
```

## Project Structure

- `src/types/`: TypeScript interfaces and types
- `src/state/`: State management for the translation graph
- `src/nodes/`: Individual nodes of the translation graph
  - `parser.ts`: Splits HTML into paragraphs
  - `translator/`: Translation subgraph
    - `main.ts`: Main translation node
    - `reviewer.ts`: Reviews translations
    - `refiner.ts`: Refines translations
  - `combiner.ts`: Combines translated paragraphs

## Lambda Integration

To use in AWS Lambda:

```typescript
import { translateContent } from 'translator-graph';

export const handler = async (event: any) => {
  const { htmlContent, metadata } = event;
  
  try {
    const result = await translateContent(htmlContent, metadata);
    return {
      statusCode: 200,
      body: JSON.stringify(result)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
```

## Development

1. Start development server:
   ```bash
   npm run dev
   ```

2. Run tests:
   ```bash
   npm test
   ```

## Environment Variables

The following environment variables are required:

- `OPENAI_API_KEY`: Your OpenAI API key for LLM operations

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Prerequisites for Jupyter Notebook Testing

1. Install Node.js and npm (https://nodejs.org/)
2. Install Python 3 (https://www.python.org/downloads/)
3. Install JupyterLab:
   ```bash
   pip install jupyterlab
   ```
4. Install tslab globally:
   ```bash
   npm install -g tslab
   ```
5. Verify tslab installation:
   ```bash
   tslab install --version
   ```
6. Install tslab kernel:
   ```bash
   tslab install --python=python3
   ```
7. Verify kernel installation:
   ```bash
   jupyter kernelspec list
   ```
   You should see both `jslab` and `tslab` kernels listed.

## Running in Jupyter Notebook

1. Build and link the package:
   ```bash
   npm run build
   npm run link:local
   ```

2. Start JupyterLab:
   ```bash
   cd notebooks
   jupyter lab
   ```

3. Create a new notebook using the TypeScript kernel (tslab)

## Troubleshooting

If you encounter the "Unexpected pending rebuildTimer" error in tslab:
1. Restart the Jupyter kernel
2. Make sure the project is built (`npm run build`)
3. Verify the package is linked (`npm run link:local`)
