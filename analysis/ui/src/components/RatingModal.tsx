import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { TranslationRating } from '../types/translation';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceSegment: string;
  targetSegment: string;
  onSave: (rating: TranslationRating) => void;
}

const ratingOptions = [
  { value: 1, label: 'Extremely Bad' },
  { value: 2, label: 'Bad' },
  { value: 3, label: 'Average' },
  { value: 4, label: 'Good' },
  { value: 5, label: 'Extremely Good' },
];

const RatingModal: React.FC<RatingModalProps> = ({
  isOpen,
  onClose,
  sourceSegment,
  targetSegment,
  onSave,
}) => {
  const [ratings, setRatings] = useState({
    accuracy: 3,
    fluency: 3,
    style: 3,
    consistency: 3,
  });
  const [comments, setComments] = useState('');

  const handleSave = () => {
    onSave({
      sourceSegment,
      targetSegment,
      ratings,
      comments,
    });
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-2xl rounded bg-white p-6 shadow-xl">
          <Dialog.Title className="text-xl font-bold mb-4">
            Rate Translation Segment
          </Dialog.Title>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Source Text:</h3>
                <p className="border rounded p-2">{sourceSegment}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Translation:</h3>
                <p className="border rounded p-2">{targetSegment}</p>
              </div>
            </div>

            <div className="space-y-4">
              {Object.entries(ratings).map(([dimension, value]) => (
                <div key={dimension}>
                  <label className="block font-semibold capitalize mb-2">
                    {dimension}
                  </label>
                  <div className="flex space-x-4">
                    {ratingOptions.map((option) => (
                      <label key={option.value} className="flex items-center">
                        <input
                          type="radio"
                          name={dimension}
                          value={option.value}
                          checked={value === option.value}
                          onChange={(e) =>
                            setRatings((prev) => ({
                              ...prev,
                              [dimension]: Number(e.target.value),
                            }))
                          }
                          className="mr-2"
                        />
                        {option.label}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div>
              <label className="block font-semibold mb-2">
                Comments (Optional)
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="w-full border rounded p-2"
                rows={3}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Save Rating
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default RatingModal; 