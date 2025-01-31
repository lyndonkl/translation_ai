import React, { useState, useCallback } from 'react';
import { TranslationOutput, TranslationRating, TranslationReview } from '../types/translation';
import DualEditor from './DualEditor';
import RatingModal from './RatingModal';

interface TranslationViewerProps {
  translation: TranslationOutput;
}

export const TranslationViewer: React.FC<TranslationViewerProps> = ({
  translation,
}) => {
  const [selectedSource, setSelectedSource] = useState<string>('');
  const [selectedTarget, setSelectedTarget] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [savedSelections, setSavedSelections] = useState<Array<{ source: string; target: string }>>([]);
  const [review, setReview] = useState<TranslationReview>({
    ratings: [],
    lastModified: new Date().toISOString(),
  });
  const [editingRating, setEditingRating] = useState<TranslationRating | null>(null);

  const handleSourceSelect = useCallback((text: string) => {
    setSelectedSource(text);
    if (!text) {
      setSelectedTarget('');
    } else if (selectedTarget) {
      setIsModalOpen(true);
    }
  }, [selectedTarget]);

  const handleTargetSelect = useCallback((text: string) => {
    setSelectedTarget(text);
    if (!text) {
      setSelectedSource('');
    } else if (selectedSource) {
      setIsModalOpen(true);
    }
  }, [selectedSource]);

  const handleSavedSelectionClick = useCallback((source: string, target: string) => {
    // Find the existing rating for this selection
    const existingRating = review.ratings.find(
      rating => rating.sourceSegment === source && rating.targetSegment === target
    );

    if (existingRating) {
      setEditingRating(existingRating);
      setSelectedSource(source);
      setSelectedTarget(target);
      setIsModalOpen(true);
    }
  }, [review.ratings]);

  const handleSaveRating = useCallback((rating: TranslationRating) => {
    const updatedReview = {
      ...review,
      ratings: editingRating
        // If editing, replace the old rating
        ? review.ratings.map(r => 
            r === editingRating ? { ...rating, lastModified: new Date().toISOString() } : r
          )
        // If new, add to the list
        : [...review.ratings, { ...rating, lastModified: new Date().toISOString() }],
      lastModified: new Date().toISOString(),
    };

    setReview(updatedReview);
    setSavedSelections(prev => {
      if (editingRating) {
        // Replace the existing selection
        return prev.map(s => 
          s.source === editingRating.sourceSegment
            ? { source: rating.sourceSegment, target: rating.targetSegment }
            : s
        );
      }
      // Add new selection
      return [...prev, { source: selectedSource, target: selectedTarget }];
    });

    setIsModalOpen(false);
    setSelectedSource('');
    setSelectedTarget('');
    setEditingRating(null);
  }, [review, editingRating, selectedSource, selectedTarget]);

  const handleSaveToFile = useCallback(async () => {
    try {
      const fileHandle = await window.showSaveFilePicker({
        suggestedName: `review_${translation.metadata.targetLanguage.toLowerCase()}.json`,
        types: [{
          description: 'JSON Files',
          accept: {
            'application/json': ['.json'],
          },
        }],
      });

      const writable = await fileHandle.createWritable();
      // Save the entire review object with all ratings in one file
      await writable.write(JSON.stringify(review, null, 2));
      await writable.close();

      // Show success message
      const saveMessage = document.createElement('div');
      saveMessage.className = 'fixed top-4 right-4 bg-green-100 p-4 rounded shadow-lg z-50';
      saveMessage.innerHTML = `
        <p class="font-semibold text-green-800">✓ Reviews saved successfully</p>
        <p class="text-sm mt-1 text-green-700">${review.ratings.length} ratings saved</p>
      `;
      document.body.appendChild(saveMessage);

      setTimeout(() => {
        if (document.body.contains(saveMessage)) {
          document.body.removeChild(saveMessage);
        }
      }, 3000);

    } catch (err: unknown) {
      // Type guard for Error objects
      if (err instanceof Error) {
        if (err.name !== 'AbortError') {
          console.error('Error saving file:', err);
          const errorMessage = document.createElement('div');
          errorMessage.className = 'fixed top-4 right-4 bg-red-100 p-4 rounded shadow-lg z-50';
          errorMessage.innerHTML = `
            <p class="font-semibold text-red-800">Error saving reviews</p>
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
    }
  }, [review, translation.metadata.targetLanguage]);

  const handleClearSelections = useCallback(() => {
    setSelectedSource('');
    setSelectedTarget('');
  }, []);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setSelectedSource('');
    setSelectedTarget('');
    setEditingRating(null);
  }, []);

  const handleLoadReviews = useCallback(async () => {
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
      const loadedReview: TranslationReview = JSON.parse(content);

      // Merge with current review state
      setReview(prev => ({
        ratings: [...prev.ratings, ...loadedReview.ratings],
        lastModified: new Date().toISOString(),
      }));

      // Update saved selections
      const newSelections = loadedReview.ratings.map(rating => ({
        source: rating.sourceSegment,
        target: rating.targetSegment,
      }));
      setSavedSelections(prev => [...prev, ...newSelections]);

      // Show success message
      const message = document.createElement('div');
      message.className = 'fixed top-4 right-4 bg-green-100 p-4 rounded shadow-lg z-50';
      message.innerHTML = `
        <p class="font-semibold text-green-800">✓ Reviews loaded successfully</p>
        <p class="text-sm mt-1 text-green-700">${loadedReview.ratings.length} ratings loaded</p>
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

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            Translation Review: {translation.metadata.sourceLanguage} → {translation.metadata.targetLanguage}
          </h1>
          <div className="flex gap-2">
            <button
              onClick={handleLoadReviews}
              className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700"
            >
              Load Reviews
            </button>
            <button
              onClick={handleSaveToFile}
              disabled={review.ratings.length === 0}
              className={`px-4 py-2 rounded-md ${
                review.ratings.length === 0
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              Save Reviews ({review.ratings.length})
            </button>
          </div>
        </div>
        
        <DualEditor
          sourceText={translation.input}
          targetText={translation.finalTranslation}
          onSourceSelect={handleSourceSelect}
          onTargetSelect={handleTargetSelect}
          savedSelections={savedSelections}
          onClearSelections={handleClearSelections}
          onSavedSelectionClick={handleSavedSelectionClick}
        />

        {isModalOpen && (
          <RatingModal
            isOpen={isModalOpen}
            onClose={handleModalClose}
            sourceSegment={selectedSource}
            targetSegment={selectedTarget}
            onSave={handleSaveRating}
            initialRating={editingRating}
          />
        )}
      </div>
    </div>
  );
};

export default TranslationViewer; 