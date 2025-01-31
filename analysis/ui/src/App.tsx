import React, { useState, useCallback } from 'react';
import { TranslationOutput } from './types/translation';
import TranslationViewer from './components/TranslationViewer';

declare global {
  interface Window {
    __TRANSLATION_DATA__: Record<string, TranslationOutput>;
  }
}

const App: React.FC = () => {
  const [translations] = useState<Record<string, TranslationOutput>>(window.__TRANSLATION_DATA__ || {});
  const [selectedLanguage, setSelectedLanguage] = useState<string>(Object.keys(translations)[0] || '');

  const handleLanguageChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = event.target.value;
    console.log('Changing language to:', newLanguage);
    setSelectedLanguage(newLanguage);
  }, []);

  if (Object.keys(translations).length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-2xl mx-auto p-4">
          <h1 className="text-xl font-bold mb-4">Translation Review Tool</h1>
          <p className="text-gray-600">
            No translation data found.
          </p>
        </div>
      </div>
    );
  }

  const currentTranslation = translations[selectedLanguage];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4">
        <div className="mb-4">
          <label htmlFor="language-select" className="block text-sm font-medium text-gray-700">
            Select Language
          </label>
          <select
            id="language-select"
            value={selectedLanguage}
            onChange={handleLanguageChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            {Object.keys(translations).map((lang) => (
              <option key={lang} value={lang}>
                {lang.charAt(0).toUpperCase() + lang.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {currentTranslation && (
          <TranslationViewer
            key={selectedLanguage}
            translation={currentTranslation}
          />
        )}
      </div>
    </div>
  );
};

export default App; 