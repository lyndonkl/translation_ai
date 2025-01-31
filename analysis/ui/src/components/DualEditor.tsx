import React, { useCallback, useState, useEffect, ReactNode } from 'react';

interface DualEditorProps {
  sourceText: string;
  targetText: string;
  onSourceSelect: (text: string) => void;
  onTargetSelect: (text: string) => void;
  savedSelections?: Array<{ source: string; target: string }>;
  onClearSelections?: () => void;
  onSavedSelectionClick?: (source: string, target: string) => void;
}

type HighlightPart = string | JSX.Element;

const DualEditor: React.FC<DualEditorProps> = ({
  sourceText,
  targetText,
  onSourceSelect,
  onTargetSelect,
  savedSelections = [],
  onClearSelections,
  onSavedSelectionClick,
}) => {
  const [sourceHighlight, setSourceHighlight] = useState<string>('');
  const [targetHighlight, setTargetHighlight] = useState<string>('');
  const [isSelecting, setIsSelecting] = useState(false);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.editor-content') && !isSelecting) {
        setSourceHighlight('');
        setTargetHighlight('');
        onClearSelections?.();
      }
    };

    const handleMouseUp = () => {
      setIsSelecting(false);
    };

    document.addEventListener('click', handleClick);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [onClearSelections, isSelecting]);

  const handleSourceSelect = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    setIsSelecting(true);
    
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim() || '';

    if (selectedText) {
      setSourceHighlight(selectedText);
      setTargetHighlight('');
      onSourceSelect(selectedText);
    } else {
      setSourceHighlight('');
      setTargetHighlight('');
      onSourceSelect('');
    }
  }, [onSourceSelect]);

  const handleTargetSelect = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    setIsSelecting(true);
    
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim() || '';

    if (selectedText) {
      setTargetHighlight(selectedText);
      onTargetSelect(selectedText);
    } else {
      setSourceHighlight('');
      setTargetHighlight('');
      onTargetSelect('');
    }
  }, [onTargetSelect]);

  const handleSavedSelectionClick = useCallback((event: React.MouseEvent, savedText: string, type: 'source' | 'target') => {
    event.stopPropagation();
    // Find the matching saved selection
    const savedSelection = savedSelections.find(selection => 
      type === 'source' 
        ? selection.source === savedText
        : selection.target === savedText
    );
    
    if (savedSelection) {
      onSavedSelectionClick?.(savedSelection.source, savedSelection.target);
    }
  }, [savedSelections, onSavedSelectionClick]);

  const renderWithHighlights = (text: string, currentHighlight: string, type: 'source' | 'target'): ReactNode[] => {
    let parts: HighlightPart[] = [text];
    
    // First, handle saved selections in a stable way
    const sortedSelections = [...savedSelections].sort((a, b) => {
      const aText = type === 'source' ? a.source : a.target;
      const bText = type === 'source' ? b.source : b.target;
      return text.indexOf(bText) - text.indexOf(aText);
    });

    // Apply saved selections (green highlights) with click handler
    sortedSelections.forEach(({ source, target }) => {
      const searchText = type === 'source' ? source : target;
      parts = parts.flatMap(part => {
        if (typeof part === 'string') {
          const index = part.indexOf(searchText);
          if (index === -1) return [part];
          return [
            part.slice(0, index),
            <span 
              key={`saved-${searchText}`} 
              className="bg-green-200 cursor-pointer hover:bg-green-300"
              onClick={(e) => handleSavedSelectionClick(e, searchText, type)}
            >
              {searchText}
            </span>,
            part.slice(index + searchText.length)
          ].filter(Boolean);
        }
        return [part];
      });
    });

    // Then handle current selection (yellow highlight)
    if (currentHighlight) {
      parts = parts.flatMap(part => {
        if (typeof part === 'string') {
          const index = part.indexOf(currentHighlight);
          if (index === -1) return [part];
          return [
            part.slice(0, index),
            <span key={`current-${currentHighlight}`} className="bg-yellow-200">{currentHighlight}</span>,
            part.slice(index + currentHighlight.length)
          ].filter(Boolean);
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