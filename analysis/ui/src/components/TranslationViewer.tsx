import React, { useState, useCallback, useEffect } from 'react';
import { TranslationOutput, TranslationRating, TranslationReview } from '../types/translation';
import DualEditor from './DualEditor';
import RatingModal from './RatingModal';

interface TranslationViewerProps {
  translation: TranslationOutput;
  review: TranslationReview | undefined;
  onUpdateReview: (review: TranslationReview) => void;
}

export const TranslationViewer: React.FC<TranslationViewerProps> = React.memo(({
  translation,
  review: initialReview,
  onUpdateReview,
}) => {
  const [selectedSource, setSelectedSource] = useState<string>('');
  const [selectedTarget, setSelectedTarget] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [savedSelections, setSavedSelections] = useState<Array<{ source: string; target: string }>>(
    initialReview?.ratings.map(rating => ({
      source: rating.sourceSegment,
      target: rating.targetSegment,
    })) || []
  );
  const [review, setReview] = useState<TranslationReview>(initialReview || {
    ratings: [],
    lastModified: new Date().toISOString(),
    sourceText: translation.input,
    translationText: translation.finalTranslation
  });
  const [editingRating, setEditingRating] = useState<TranslationRating | null>(null);

  // Clear selections and editing state when translation changes
  useEffect(() => {
    setSelectedSource('');
    setSelectedTarget('');
    setEditingRating(null);
    setIsModalOpen(false);
    setSavedSelections(
      initialReview?.ratings.map(rating => ({
        source: rating.sourceSegment,
        target: rating.targetSegment,
      })) || []
    );
  }, [translation, initialReview]);

  // Update local state when initialReview changes
  useEffect(() => {
    if (initialReview) {
      setReview(initialReview);
    } else {
      // If no initial review, create new one with current texts
      setReview({
        ratings: [],
        lastModified: new Date().toISOString(),
        sourceText: translation.input,
        translationText: translation.finalTranslation
      });
    }
  }, [initialReview, translation]);

  // Memoize the update callback to prevent unnecessary re-renders
  const handleUpdateReview = useCallback((newReview: TranslationReview) => {
    onUpdateReview(newReview);
  }, [onUpdateReview]);

  // Update parent when local state changes, but with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleUpdateReview(review);
    }, 100); // Small delay to prevent rapid updates

    return () => clearTimeout(timeoutId);
  }, [review, handleUpdateReview]);

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
        ? review.ratings.map(r => 
            r === editingRating ? { ...rating, lastModified: new Date().toISOString() } : r
          )
        : [...review.ratings, { ...rating, lastModified: new Date().toISOString() }],
      lastModified: new Date().toISOString(),
      sourceText: translation.input,
      translationText: translation.finalTranslation
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
  }, [review, editingRating, selectedSource, selectedTarget, translation]);

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

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            Translation Review: {translation.metadata.sourceLanguage} → {translation.metadata.targetLanguage}
          </h1>
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
});

export default TranslationViewer; 