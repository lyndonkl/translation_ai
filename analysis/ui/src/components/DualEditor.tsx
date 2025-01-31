import React, { useCallback, useState, useEffect, ReactNode } from 'react';

interface DualEditorProps {
  sourceText: string;
  targetText: string;
  onSourceSelect: (text: string) => void;
  onTargetSelect: (text: string) => void;
  savedSelections?: Array<{ source: string; target: string }>;
  onClearSelections?: () => void;
}

type HighlightPart = string | JSX.Element;

const DualEditor: React.FC<DualEditorProps> = ({
  sourceText,
  targetText,
  onSourceSelect,
  onTargetSelect,
  savedSelections = [],
  onClearSelections,
}) => {
  const [sourceSelection, setSourceSelection] = useState<string>('');
  const [sourceHighlight, setSourceHighlight] = useState<string>('');
  const [targetHighlight, setTargetHighlight] = useState<string>('');
  const [isSelecting, setIsSelecting] = useState(false);

  // Clear selections on document click
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.editor-content') && !isSelecting) {
        clearCurrentSelections();
      }
    };

    const handleMouseUp = () => {
      setIsSelecting(false);
    };

    document.addEventListener('click', handleDocumentClick);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('click', handleDocumentClick);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isSelecting]);

  const clearCurrentSelections = () => {
    setSourceSelection('');
    setSourceHighlight('');
    setTargetHighlight('');
    onClearSelections?.();
  };

  const handleSourceSelect = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsSelecting(true);

    const selection = window.getSelection();
    if (selection && selection.toString()) {
      const selectedText = selection.toString().trim();
      if (selectedText) {
        setSourceSelection(selectedText);
        setSourceHighlight(selectedText);
        setTargetHighlight(''); // Clear target highlight when selecting source
        onSourceSelect(selectedText);
      }
    } else if (!isSelecting) {
      clearCurrentSelections();
    }
  }, [onSourceSelect, isSelecting]);

  const handleTargetSelect = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsSelecting(true);

    const selection = window.getSelection();
    if (selection && selection.toString()) {
      const selectedText = selection.toString().trim();
      if (selectedText && sourceSelection) {
        setTargetHighlight(selectedText);
        onTargetSelect(selectedText);
      } else if (selectedText) {
        clearCurrentSelections();
      }
    } else if (!isSelecting) {
      clearCurrentSelections();
    }
  }, [onTargetSelect, sourceSelection, isSelecting]);

  const renderWithHighlights = (text: string, currentHighlight: string, type: 'source' | 'target'): ReactNode[] => {
    let parts: HighlightPart[] = [text];
    
    // First, handle saved selections
    savedSelections.forEach(({ source, target }) => {
      parts = parts.flatMap(part => {
        const searchText = type === 'source' ? source : target;
        if (typeof part === 'string') {
          return part.split(searchText).map((subPart, i, arr) => {
            if (i === arr.length - 1) return subPart;
            return [
              subPart,
              <span key={`saved-${i}`} className="bg-green-200">{searchText}</span>
            ] as HighlightPart[];
          }).flat();
        }
        return [part];
      });
    });

    // Then, handle current selection
    if (currentHighlight) {
      parts = parts.flatMap(part => {
        if (typeof part === 'string') {
          return part.split(currentHighlight).map((subPart, i, arr) => {
            if (i === arr.length - 1) return subPart;
            return [
              subPart,
              <span key={`current-${i}`} className="bg-yellow-200">{currentHighlight}</span>
            ] as HighlightPart[];
          }).flat();
        }
        return [part];
      });
    }

    return parts;
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="border rounded p-4">
        <h2 className="text-lg font-semibold mb-2">Source Text</h2>
        <div 
          className="prose whitespace-pre-wrap editor-content"
          onMouseUp={handleSourceSelect}
        >
          {renderWithHighlights(sourceText, sourceHighlight, 'source')}
        </div>
      </div>

      <div className="border rounded p-4">
        <h2 className="text-lg font-semibold mb-2">Translation</h2>
        <div 
          className="prose whitespace-pre-wrap editor-content"
          onMouseUp={handleTargetSelect}
        >
          {renderWithHighlights(targetText, targetHighlight, 'target')}
        </div>
      </div>
    </div>
  );
};

export default DualEditor; 