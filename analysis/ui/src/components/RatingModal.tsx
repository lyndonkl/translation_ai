import React, { useState, useEffect } from 'react';
import { Dialog, Tab } from '@headlessui/react';
import { TranslationRating } from '../types/translation';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceSegment: string;
  targetSegment: string;
  onSave: (rating: TranslationRating) => void;
  initialRating?: TranslationRating | null;
}

// Define the rating dimension keys as a type
type RatingDimensionKey = keyof TranslationRating['ratings'];

// Define the rating dimensions with their descriptions and scale
const ratingDimensions: Record<RatingDimensionKey, {
  title: string;
  description: string;
  scale: Array<{
    value: number;
    label: string;
    description: string;
  }>;
}> = {
  accuracy: {
    title: 'Accuracy',
    description: 'Measures how closely the translation conveys the meaning of the source text without distortion, omission, or addition.',
    scale: [
      { value: 5, label: 'Perfect', description: 'The translation conveys the exact meaning of the source text with no errors.' },
      { value: 4, label: 'Good', description: 'The meaning is conveyed well, but there are minor inaccuracies that don\'t affect comprehension.' },
      { value: 3, label: 'Acceptable', description: 'The meaning is mostly preserved, but there are some noticeable errors.' },
      { value: 2, label: 'Poor', description: 'Significant meaning is lost or distorted, affecting comprehension.' },
      { value: 1, label: 'Unacceptable', description: 'The translation is completely incorrect or misleading.' }
    ]
  },
  fluency: {
    title: 'Fluency',
    description: 'Assesses the naturalness and grammatical correctness of the translated text in the target language.',
    scale: [
      { value: 5, label: 'Perfect', description: 'Sounds completely natural, with no grammar or syntax errors.' },
      { value: 4, label: 'Good', description: 'Mostly natural, but may have minor grammatical issues.' },
      { value: 3, label: 'Acceptable', description: 'Some awkward phrasing or noticeable grammar mistakes.' },
      { value: 2, label: 'Poor', description: 'Difficult to read due to frequent grammar and structure issues.' },
      { value: 1, label: 'Unacceptable', description: 'Completely unnatural or incomprehensible.' }
    ]
  },
  style: {
    title: 'Style',
    description: 'Assesses whether the tone, formality, and writing style match the source text and target audience expectations.',
    scale: [
      { value: 5, label: 'Perfect', description: 'The style is entirely appropriate for the context and audience.' },
      { value: 4, label: 'Good', description: 'Mostly appropriate, with only minor deviations.' },
      { value: 3, label: 'Acceptable', description: 'Some stylistic mismatches, but the message is still understandable.' },
      { value: 2, label: 'Poor', description: 'Noticeable mismatches in tone or formality.' },
      { value: 1, label: 'Unacceptable', description: 'Completely inappropriate style or tone for the context.' }
    ]
  },
  consistency: {
    title: 'Consistency',
    description: 'Evaluates whether key terms, phrases, and style are used uniformly throughout the text.',
    scale: [
      { value: 5, label: 'Perfect', description: 'Terminology, phrasing, and style are completely consistent.' },
      { value: 4, label: 'Good', description: 'Mostly consistent with only a few minor inconsistencies.' },
      { value: 3, label: 'Acceptable', description: 'Some inconsistencies, but they don\'t significantly impact comprehension.' },
      { value: 2, label: 'Poor', description: 'Noticeable inconsistencies that can confuse the reader.' },
      { value: 1, label: 'Unacceptable', description: 'Inconsistent use of key terms and phrasing, making the text hard to follow.' }
    ]
  },
  formatting: {
    title: 'Formatting',
    description: 'Checks whether the translation retains the structure and layout conventions of the source text.',
    scale: [
      { value: 5, label: 'Perfect', description: 'Fully retains original formatting, including special characters and spacing.' },
      { value: 4, label: 'Good', description: 'Small formatting inconsistencies, but readability is unaffected.' },
      { value: 3, label: 'Acceptable', description: 'Some formatting differences, but key information is still clear.' },
      { value: 2, label: 'Poor', description: 'Formatting issues that make reading or understanding difficult.' },
      { value: 1, label: 'Unacceptable', description: 'Formatting is completely incorrect, disrupting readability.' }
    ]
  },
  readability: {
    title: 'Readability',
    description: 'Evaluates whether the translation is easy to read and understand for the intended audience.',
    scale: [
      { value: 5, label: 'Perfect', description: 'Very clear and easy to understand, with a smooth flow.' },
      { value: 4, label: 'Good', description: 'Mostly clear, with minor readability issues.' },
      { value: 3, label: 'Acceptable', description: 'Somewhat clear, but requires effort to understand.' },
      { value: 2, label: 'Poor', description: 'Difficult to read and requires multiple readings to understand.' },
      { value: 1, label: 'Unacceptable', description: 'Almost impossible to read or understand.' }
    ]
  },
  terminology: {
    title: 'Terminology',
    description: 'Evaluates the use of appropriate industry-specific or technical terms.',
    scale: [
      { value: 5, label: 'Perfect', description: 'All terms are correct and match standard terminology.' },
      { value: 4, label: 'Good', description: 'Mostly correct, with a few minor terminology issues.' },
      { value: 3, label: 'Acceptable', description: 'Some incorrect or inconsistent terminology, but meaning is clear.' },
      { value: 2, label: 'Poor', description: 'Incorrect terminology that affects comprehension.' },
      { value: 1, label: 'Unacceptable', description: 'Terminology is completely incorrect or misleading.' }
    ]
  }
};

const RatingModal: React.FC<RatingModalProps> = ({
  isOpen,
  onClose,
  sourceSegment,
  targetSegment,
  onSave,
  initialRating = null,
}) => {
  const [rating, setRating] = useState({
    sourceSegment,
    targetSegment,
    lastModified: new Date().toISOString(),
    ratings: {
      accuracy: initialRating?.ratings?.accuracy ?? 3,
      fluency: initialRating?.ratings?.fluency ?? 3,
      style: initialRating?.ratings?.style ?? 3,
      consistency: initialRating?.ratings?.consistency ?? 3,
      formatting: initialRating?.ratings?.formatting ?? 3,
      readability: initialRating?.ratings?.readability ?? 3,
      terminology: initialRating?.ratings?.terminology ?? 3,
    },
    comments: initialRating?.comments ?? '',
  });

  useEffect(() => {
    if (initialRating) {
      setRating({
        sourceSegment,
        targetSegment,
        lastModified: new Date().toISOString(),
        ratings: { ...initialRating.ratings },
        comments: initialRating.comments || '',
      });
    }
  }, [initialRating, sourceSegment, targetSegment]);

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto w-full max-w-4xl rounded bg-white shadow-xl">
          <div className="max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-6 border-b">
              <Dialog.Title className="text-xl font-bold">
                Rate Translation Segment
              </Dialog.Title>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <h3 className="font-semibold mb-2">Source Text:</h3>
                  <p className="border rounded p-2 bg-gray-50">{sourceSegment}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Translation:</h3>
                  <p className="border rounded p-2 bg-gray-50">{targetSegment}</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <Tab.Group>
                <Tab.List className="flex space-x-2 border-b">
                  {(Object.entries(ratingDimensions) as Array<[RatingDimensionKey, typeof ratingDimensions[RatingDimensionKey]]>).map(([key, dim]) => (
                    <Tab
                      key={key}
                      className={({ selected }) =>
                        `px-4 py-2 rounded-t-lg focus:outline-none ${
                          selected
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`
                      }
                    >
                      {dim.title}
                    </Tab>
                  ))}
                </Tab.List>
                <Tab.Panels className="mt-4">
                  {(Object.entries(ratingDimensions) as Array<[RatingDimensionKey, typeof ratingDimensions[RatingDimensionKey]]>).map(([key, dim]) => (
                    <Tab.Panel key={key} className="space-y-4">
                      <div className="bg-blue-50 p-4 rounded">
                        <p className="text-sm text-blue-800">{dim.description}</p>
                      </div>
                      <div className="space-y-2">
                        {dim.scale.map((option) => (
                          <label
                            key={option.value}
                            className={`flex items-start p-3 rounded border ${
                              rating.ratings[key] === option.value
                                ? 'border-blue-500 bg-blue-50'
                                : 'hover:bg-gray-50'
                            }`}
                          >
                            <input
                              type="radio"
                              name={key}
                              value={option.value}
                              checked={rating.ratings[key] === option.value}
                              onChange={(e) =>
                                setRating((prev) => ({
                                  ...prev,
                                  ratings: {
                                    ...prev.ratings,
                                    [key]: Number(e.target.value),
                                  },
                                }))
                              }
                              className="mt-1 mr-3"
                            />
                            <div>
                              <div className="font-medium">
                                {option.value} - {option.label}
                              </div>
                              <div className="text-sm text-gray-600">
                                {option.description}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </Tab.Panel>
                  ))}
                </Tab.Panels>
              </Tab.Group>

              <div className="mt-6">
                <label className="block font-semibold mb-2">
                  Additional Comments
                </label>
                <textarea
                  value={rating.comments}
                  onChange={(e) => setRating((prev) => ({ ...prev, comments: e.target.value }))}
                  className="w-full border rounded p-2"
                  rows={3}
                  placeholder="Add any additional observations or notes..."
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-white p-6 border-t">
              <div className="flex justify-end space-x-4">
                <button
                  onClick={onClose}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={() => onSave(rating)}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Add Rating
                </button>
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default RatingModal; 