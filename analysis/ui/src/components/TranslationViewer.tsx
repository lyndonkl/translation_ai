import React, { useState, useCallback } from 'react';
import { TranslationOutput, TranslationRating } from '../types/translation';
import DualEditor from './DualEditor';
import RatingModal from './RatingModal';

interface TranslationViewerProps {
  translation: TranslationOutput;
  onSaveRating: (rating: TranslationRating) => void;
}

export const TranslationViewer: React.FC<TranslationViewerProps> = ({
  translation,
  onSaveRating,
}) => {
  const [selectedSource, setSelectedSource] = useState<string>('');
  const [selectedTarget, setSelectedTarget] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [savedSelections, setSavedSelections] = useState<Array<{ source: string; target: string }>>([]);

  const handleSourceSelect = useCallback((text: string) => {
    setSelectedSource(text);
    if (selectedTarget) {
      setIsModalOpen(true);
    }
  }, [selectedTarget]);

  const handleTargetSelect = useCallback((text: string) => {
    setSelectedTarget(text);
    if (selectedSource) {
      setIsModalOpen(true);
    }
  }, [selectedSource]);

  const handleSaveRating = useCallback((rating: TranslationRating) => {
    onSaveRating(rating);
    setSavedSelections(prev => [...prev, { source: selectedSource, target: selectedTarget }]);
    setIsModalOpen(false);
    setSelectedSource('');
    setSelectedTarget('');
  }, [onSaveRating, selectedSource, selectedTarget]);

  const handleClearSelections = useCallback(() => {
    setSelectedSource('');
    setSelectedTarget('');
  }, []);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setSelectedSource('');
    setSelectedTarget('');
  }, []);

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col space-y-4">
        <h1 className="text-2xl font-bold">
          Translation Review: {translation.metadata.sourceLanguage} → {translation.metadata.targetLanguage}
        </h1>
        
        <DualEditor
          sourceText={translation.input}
          targetText={translation.finalTranslation}
          onSourceSelect={handleSourceSelect}
          onTargetSelect={handleTargetSelect}
          savedSelections={savedSelections}
          onClearSelections={handleClearSelections}
        />

        {isModalOpen && (
          <RatingModal
            isOpen={isModalOpen}
            onClose={handleModalClose}
            sourceSegment={selectedSource}
            targetSegment={selectedTarget}
            onSave={handleSaveRating}
          />
        )}
      </div>
    </div>
  );
};

export default TranslationViewer; 