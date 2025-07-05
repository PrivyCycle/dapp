import React from 'react';
import type { Symptom } from '../../lib/types/cycle';
import { getSymptomDisplayName } from '../../hooks/data/useLogEntries';

interface SymptomPickerProps {
  selectedSymptoms: Symptom[];
  onChange: (symptoms: Symptom[]) => void;
}

export const SymptomPicker: React.FC<SymptomPickerProps> = ({ selectedSymptoms, onChange }) => {
  const symptomCategories = {
    physical: {
      label: 'Physical Symptoms',
      icon: '🩺',
      symptoms: ['cramps', 'headache', 'bloating', 'breast_tenderness', 'back_pain', 'nausea'] as Symptom[]
    },
    emotional: {
      label: 'Emotional & Mental',
      icon: '🧠',
      symptoms: ['mood_swings', 'fatigue'] as Symptom[]
    },
    other: {
      label: 'Other',
      icon: '📝',
      symptoms: ['acne', 'food_cravings'] as Symptom[]
    }
  };

  const toggleSymptom = (symptom: Symptom): void => {
    if (selectedSymptoms.includes(symptom)) {
      onChange(selectedSymptoms.filter(s => s !== symptom));
    } else {
      onChange([...selectedSymptoms, symptom]);
    }
  };

  const getSymptomIcon = (symptom: Symptom): string => {
    const icons: Record<Symptom, string> = {
      cramps: '🤕',
      headache: '🤯',
      bloating: '🫃',
      breast_tenderness: '💔',
      mood_swings: '🎭',
      fatigue: '😴',
      nausea: '🤢',
      back_pain: '🦴',
      acne: '🔴',
      food_cravings: '🍫'
    };
    return icons[symptom] || '📝';
  };

  return (
    <div className="space-y-6">
      <div className="text-sm text-text-secondary">
        Select any symptoms you're experiencing today. You can choose multiple symptoms.
      </div>
      
      {Object.entries(symptomCategories).map(([categoryKey, category]) => (
        <div key={categoryKey} className="space-y-3">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{category.icon}</span>
            <h3 className="font-semibold text-text-primary">{category.label}</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {category.symptoms.map((symptom) => (
              <button
                key={symptom}
                type="button"
                onClick={() => toggleSymptom(symptom)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                  selectedSymptoms.includes(symptom)
                    ? 'border-accent-primary bg-accent-primary/10 shadow-glow'
                    : 'border-border-primary bg-bg-tertiary hover:border-border-secondary hover:bg-bg-tertiary/80'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{getSymptomIcon(symptom)}</div>
                  <div className="flex-1">
                    <div className={`font-medium ${
                      selectedSymptoms.includes(symptom) ? 'text-accent-primary' : 'text-text-primary'
                    }`}>
                      {getSymptomDisplayName(symptom)}
                    </div>
                  </div>
                  {selectedSymptoms.includes(symptom) && (
                    <div className="text-accent-primary">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
      
      {selectedSymptoms.length > 0 && (
        <div className="p-4 bg-accent-primary/10 border border-accent-primary/20 rounded-lg">
          <div className="text-sm font-medium text-accent-primary mb-2">
            Selected Symptoms ({selectedSymptoms.length})
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedSymptoms.map((symptom) => (
              <span
                key={symptom}
                className="inline-flex items-center space-x-1 px-3 py-1 bg-accent-primary/20 text-accent-primary rounded-full text-sm"
              >
                <span>{getSymptomIcon(symptom)}</span>
                <span>{getSymptomDisplayName(symptom)}</span>
                <button
                  type="button"
                  onClick={() => toggleSymptom(symptom)}
                  className="ml-1 hover:bg-accent-primary/30 rounded-full p-1"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
