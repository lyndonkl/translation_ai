import React, { useState, useCallback, useMemo } from 'react';
import { TranslationOutput, TranslationReview } from './types/translation';
import TranslationViewer from './components/TranslationViewer';

declare global {
  interface Window {
    __TRANSLATION_DATA__: Record<string, TranslationOutput>;
  }
}

const App: React.FC = () => {
  const [translations] = useState<Record<string, TranslationOutput>>(window.__TRANSLATION_DATA__ || {});
  const [selectedLanguage, setSelectedLanguage] = useState<string>(Object.keys(translations)[0] || '');
  const [reviews, setReviews] = useState<Record<string, TranslationReview>>({});

  const handleLanguageChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = event.target.value;
    console.log('Changing language to:', newLanguage);
    setSelectedLanguage(newLanguage);
  }, []);

  const handleUpdateReview = useCallback((language: string, review: TranslationReview) => {
    setReviews(prev => ({
      ...prev,
      [language]: review
    }));
  }, []);

  const handleSaveAllReviews = useCallback(async () => {
    try {
      const fileHandle = await window.showSaveFilePicker({
        suggestedName: 'translation_reviews.json',
        types: [{
          description: 'JSON Files',
          accept: {
            'application/json': ['.json'],
          },
        }],
      });

      const writable = await fileHandle.createWritable();
      await writable.write(JSON.stringify(reviews, null, 2));
      await writable.close();

      const totalReviews = Object.values(reviews).reduce(
        (total, review) => total + review.ratings.length,
        0
      );

      // Show success message
      const message = document.createElement('div');
      message.className = 'fixed top-4 right-4 bg-green-100 p-4 rounded shadow-lg z-50';
      message.innerHTML = `
        <p class="font-semibold text-green-800">✓ All reviews saved successfully</p>
        <p class="text-sm mt-1 text-green-700">Saved ${totalReviews} reviews across ${Object.keys(reviews).length} languages</p>
      `;
      document.body.appendChild(message);

      setTimeout(() => {
        if (document.body.contains(message)) {
          document.body.removeChild(message);
        }
      }, 3000);
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') {
        console.error('Error saving reviews:', err);
      }
    }
  }, [reviews]);

  const handleLoadAllReviews = useCallback(async () => {
    try {
      const [fileHandle] = await window.showOpenFilePicker({
        types: [{
          description: 'JSON Files',
          accept: {
            'application/json': ['.json'],
          },
        }],
        multiple: false
      });

      const file = await fileHandle.getFile();
      const content = await file.text();
      const loadedReviews = JSON.parse(content) as Record<string, TranslationReview>;

      // Validate the loaded data structure
      if (typeof loadedReviews !== 'object') {
        throw new Error('Invalid review file format');
      }

      // Validate each review in the loaded data
      Object.entries(loadedReviews).forEach(([lang, review]) => {
        if (!Array.isArray(review.ratings)) {
          throw new Error(`Invalid ratings format for language: ${lang}`);
        }
      });

      // Reset the reviews state completely with the loaded data
      setReviews(loadedReviews);

      const totalReviews = Object.values(loadedReviews).reduce(
        (total, review) => total + review.ratings.length,
        0
      );

      // Show success message
      const message = document.createElement('div');
      message.className = 'fixed top-4 right-4 bg-green-100 p-4 rounded shadow-lg z-50';
      message.innerHTML = `
        <p class="font-semibold text-green-800">✓ Reviews loaded successfully</p>
        <p class="text-sm mt-1 text-green-700">Loaded ${totalReviews} reviews across ${Object.keys(loadedReviews).length} languages</p>
      `;
      document.body.appendChild(message);

      setTimeout(() => {
        if (document.body.contains(message)) {
          document.body.removeChild(message);
        }
      }, 3000);
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') {
        console.error('Error loading reviews:', err);
        const errorMessage = document.createElement('div');
        errorMessage.className = 'fixed top-4 right-4 bg-red-100 p-4 rounded shadow-lg z-50';
        errorMessage.innerHTML = `
          <p class="font-semibold text-red-800">Error loading reviews</p>
          <p class="text-sm mt-1 text-red-700">${err.message}</p>
        `;
        document.body.appendChild(errorMessage);

        setTimeout(() => {
          if (document.body.contains(errorMessage)) {
            document.body.removeChild(errorMessage);
          }
        }, 5000);
      }
    }
  }, []);

  // Calculate total number of reviews across all languages
  const totalReviewCount = Object.values(reviews).reduce(
    (total, review) => total + review.ratings.length,
    0
  );

  // Memoize the current review to prevent unnecessary re-renders
  const currentReview = useMemo(() => 
    reviews[selectedLanguage], 
    [reviews, selectedLanguage]
  );

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
        <div className="flex justify-between items-center mb-4">
          <div className="flex-1">
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
          <div className="flex gap-2 ml-4">
            <button
              onClick={handleLoadAllReviews}
              className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700"
            >
              Load All Reviews
            </button>
            <button
              onClick={handleSaveAllReviews}
              disabled={totalReviewCount === 0}
              className={`px-4 py-2 rounded-md ${
                totalReviewCount === 0
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              Save All Reviews ({totalReviewCount})
            </button>
          </div>
        </div>

        {currentTranslation && (
          <TranslationViewer
            translation={currentTranslation}
            review={currentReview}
            onUpdateReview={(review) => handleUpdateReview(selectedLanguage, review)}
          />
        )}
      </div>
    </div>
  );
};

export default App; 