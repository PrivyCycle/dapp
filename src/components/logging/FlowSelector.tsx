import React from 'react';
import type { FlowIntensity } from '../../lib/types/cycle';

interface FlowSelectorProps {
  value: FlowIntensity | '';
  onChange: (flow: FlowIntensity | '') => void;
}

export const FlowSelector: React.FC<FlowSelectorProps> = ({ value, onChange }) => {
  const flowOptions: { value: FlowIntensity; label: string; description: string; color: string; size: string }[] = [
    { 
      value: 'spotting', 
      label: 'Spotting', 
      description: 'Very light, intermittent bleeding',
      color: 'bg-text-muted', 
      size: 'w-2 h-2' 
    },
    { 
      value: 'light', 
      label: 'Light', 
      description: 'Light flow, minimal protection needed',
      color: 'bg-accent-primary', 
      size: 'w-3 h-3' 
    },
    { 
      value: 'medium', 
      label: 'Medium', 
      description: 'Regular flow, normal protection',
      color: 'bg-warning', 
      size: 'w-4 h-4' 
    },
    { 
      value: 'heavy', 
      label: 'Heavy', 
      description: 'Heavy flow, extra protection needed',
      color: 'bg-error', 
      size: 'w-5 h-5' 
    }
  ];

  return (
    <div className="space-y-4">
      <div className="text-sm text-text-secondary mb-4">
        Select the flow intensity that best matches your current experience
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {flowOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(value === option.value ? '' : option.value)}
            className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
              value === option.value
                ? 'border-accent-primary bg-accent-primary/10 shadow-glow'
                : 'border-border-primary bg-bg-tertiary hover:border-border-secondary hover:bg-bg-tertiary/80'
            }`}
          >
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-12 h-12 bg-bg-secondary rounded-full">
                <div className={`${option.color} ${option.size} rounded-full`}></div>
              </div>
              <div className="flex-1">
                <div className="font-semibold text-text-primary mb-1">{option.label}</div>
                <div className="text-sm text-text-secondary">{option.description}</div>
              </div>
              {value === option.value && (
                <div className="text-accent-primary">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
