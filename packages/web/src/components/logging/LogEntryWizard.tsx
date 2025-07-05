import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input, Textarea } from '../ui/Input';
import { Card, CardContent } from '../ui/Card';
import { FlowSelector } from './FlowSelector';
import { SymptomPicker } from './SymptomPicker';
import { useEncryptedLogEntries } from '../../hooks/data/useEncryptedLogEntries';
import type { FlowIntensity, Symptom, Mood } from '../../lib/types/cycle';

interface LogEntryWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onEntryAdded?: () => void;
}

type WizardStep = 'date' | 'flow' | 'symptoms' | 'mood-energy' | 'notes' | 'review';

export const LogEntryWizard: React.FC<LogEntryWizardProps> = ({ isOpen, onClose, onEntryAdded }) => {
  const { addEntry } = useEncryptedLogEntries();
  const [currentStep, setCurrentStep] = useState<WizardStep>('date');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [flow, setFlow] = useState<FlowIntensity | ''>('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<Symptom[]>([]);
  const [mood, setMood] = useState<Mood | ''>('');
  const [energyLevel, setEnergyLevel] = useState<number>(3);
  const [notes, setNotes] = useState('');

  const moodOptions: { value: Mood; label: string; emoji: string }[] = [
    { value: 'happy', label: 'Happy', emoji: '😊' },
    { value: 'energetic', label: 'Energetic', emoji: '⚡' },
    { value: 'calm', label: 'Calm', emoji: '😌' },
    { value: 'tired', label: 'Tired', emoji: '😴' },
    { value: 'sad', label: 'Sad', emoji: '😢' },
    { value: 'irritable', label: 'Irritable', emoji: '😤' },
    { value: 'anxious', label: 'Anxious', emoji: '😰' }
  ];

  const steps: { key: WizardStep; title: string; description: string }[] = [
    { key: 'date', title: 'Date', description: 'When did this occur?' },
    { key: 'flow', title: 'Flow', description: 'Track your period flow' },
    { key: 'symptoms', title: 'Symptoms', description: 'Any symptoms today?' },
    { key: 'mood-energy', title: 'Mood & Energy', description: 'How are you feeling?' },
    { key: 'notes', title: 'Notes', description: 'Any additional details?' },
    { key: 'review', title: 'Review', description: 'Confirm your entry' }
  ];

  const getCurrentStepIndex = () => steps.findIndex(step => step.key === currentStep);
  const isFirstStep = getCurrentStepIndex() === 0;
  const isLastStep = getCurrentStepIndex() === steps.length - 1;

  const handleNext = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].key);
    }
  };

  const handlePrevious = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].key);
    }
  };

  const handleQuickEntry = (type: 'period' | 'symptoms') => {
    if (type === 'period') {
      setFlow('medium');
      setSelectedSymptoms(['cramps']);
      setMood('tired');
      setEnergyLevel(2);
      setNotes('Period started today');
      setCurrentStep('review');
    } else {
      setCurrentStep('symptoms');
    }
  };

  const resetForm = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setFlow('');
    setSelectedSymptoms([]);
    setMood('');
    setEnergyLevel(3);
    setNotes('');
    setCurrentStep('date');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await addEntry({
        date: new Date(selectedDate),
        flow: flow || undefined,
        symptoms: selectedSymptoms,
        mood: mood || undefined,
        energyLevel,
        notes: notes.trim() || undefined
      });

      resetForm();
      onClose();
      if (onEntryAdded) {
        onEntryAdded();
      }
    } catch (error) {
      console.error('Error logging entry:', error);
      alert('Error logging entry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'date':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-lg font-semibold text-text-primary mb-2">When did this occur?</h3>
              <p className="text-text-secondary">Select the date for this log entry</p>
            </div>
            <div className="flex justify-center">
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="max-w-xs text-center"
              />
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-text-primary text-center">Quick Actions</h4>
                             <div className="grid grid-cols-2 gap-3">
                 <Button
                   variant="secondary"
                   onClick={() => handleQuickEntry('period')}
                   className="h-16"
                 >
                   <div className="text-center">
                     <div className="text-2xl mb-1">🩸</div>
                     <div className="text-sm">Period Started</div>
                   </div>
                 </Button>
                 <Button
                   variant="secondary"
                   onClick={() => handleQuickEntry('symptoms')}
                   className="h-16"
                 >
                   <div className="text-center">
                     <div className="text-2xl mb-1">💊</div>
                     <div className="text-sm">Log Symptoms</div>
                   </div>
                 </Button>
               </div>
            </div>
          </div>
        );

      case 'flow':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-lg font-semibold text-text-primary mb-2">Flow Intensity</h3>
              <p className="text-text-secondary">Select the flow intensity that best matches your current experience</p>
            </div>
            <FlowSelector value={flow} onChange={setFlow} />
            <div className="text-center">
              <Button variant="ghost" size="sm" onClick={handleNext}>
                Skip this step
              </Button>
            </div>
          </div>
        );

      case 'symptoms':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-lg font-semibold text-text-primary mb-2">Symptoms</h3>
              <p className="text-text-secondary">Select any symptoms you're experiencing today</p>
            </div>
            <SymptomPicker selectedSymptoms={selectedSymptoms} onChange={setSelectedSymptoms} />
            <div className="text-center">
              <Button variant="ghost" size="sm" onClick={handleNext}>
                No symptoms today
              </Button>
            </div>
          </div>
        );

      case 'mood-energy':
        return (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h3 className="text-lg font-semibold text-text-primary mb-2">Mood & Energy</h3>
              <p className="text-text-secondary">How are you feeling today?</p>
            </div>
            
            {/* Mood */}
            <div>
              <h4 className="text-sm font-medium text-text-primary mb-4">Mood</h4>
              <div className="grid grid-cols-3 md:grid-cols-7 gap-3">
                {moodOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setMood(mood === option.value ? '' : option.value)}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                      mood === option.value
                        ? 'border-accent-primary bg-accent-primary/10'
                        : 'border-border-primary bg-bg-tertiary hover:border-border-secondary'
                    }`}
                  >
                    <div className="text-2xl mb-1">{option.emoji}</div>
                    <div className="text-xs text-text-secondary">{option.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Energy Level */}
            <div>
              <h4 className="text-sm font-medium text-text-primary mb-4">Energy Level</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Low</span>
                  <span className="text-text-secondary">High</span>
                </div>
                <div className="flex space-x-2 justify-center">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setEnergyLevel(level)}
                      className={`w-12 h-12 rounded-full border-2 transition-all duration-200 ${
                        energyLevel >= level
                          ? 'border-accent-primary bg-accent-primary'
                          : 'border-border-primary bg-bg-tertiary hover:border-border-secondary'
                      }`}
                    >
                      <span className="text-sm font-medium text-text-primary">{level}</span>
                    </button>
                  ))}
                </div>
                <div className="text-center text-text-secondary text-sm">
                  Current: {energyLevel}/5
                </div>
              </div>
            </div>
          </div>
        );

      case 'notes':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-lg font-semibold text-text-primary mb-2">Additional Notes</h3>
              <p className="text-text-secondary">Any additional details about how you're feeling today?</p>
            </div>
            <Textarea
              placeholder="Any additional notes about how you're feeling today..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={6}
            />
            <div className="text-center">
              <Button variant="ghost" size="sm" onClick={handleNext}>
                Skip notes
              </Button>
            </div>
          </div>
        );

      case 'review':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-lg font-semibold text-text-primary mb-2">Review Your Entry</h3>
              <p className="text-text-secondary">Please review your information before saving</p>
            </div>
            
            <div className="space-y-4">
              <Card>
                <CardContent className="py-4">
                  <div className="flex justify-between">
                    <span className="font-medium text-text-primary">Date</span>
                    <span className="text-text-secondary">{new Date(selectedDate).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>

              {flow && (
                <Card>
                  <CardContent className="py-4">
                    <div className="flex justify-between">
                      <span className="font-medium text-text-primary">Flow</span>
                      <span className="text-text-secondary capitalize">{flow}</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {selectedSymptoms.length > 0 && (
                <Card>
                  <CardContent className="py-4">
                    <div className="flex justify-between">
                      <span className="font-medium text-text-primary">Symptoms</span>
                      <span className="text-text-secondary">{selectedSymptoms.length} selected</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {mood && (
                <Card>
                  <CardContent className="py-4">
                    <div className="flex justify-between">
                      <span className="font-medium text-text-primary">Mood</span>
                      <span className="text-text-secondary capitalize">{mood}</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardContent className="py-4">
                  <div className="flex justify-between">
                    <span className="font-medium text-text-primary">Energy Level</span>
                    <span className="text-text-secondary">{energyLevel}/5</span>
                  </div>
                </CardContent>
              </Card>

              {notes && (
                <Card>
                  <CardContent className="py-4">
                    <div>
                      <span className="font-medium text-text-primary">Notes</span>
                      <p className="text-text-secondary mt-2">{notes}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <div className="min-h-[600px] flex flex-col">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-text-primary">
              {steps.find(step => step.key === currentStep)?.title}
            </h2>
            <span className="text-sm text-text-muted">
              {getCurrentStepIndex() + 1} of {steps.length}
            </span>
          </div>
          <div className="w-full bg-bg-tertiary rounded-full h-2">
            <div 
              className="bg-accent-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${((getCurrentStepIndex() + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="flex-1">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-6 mt-auto border-t border-border-primary">
          <Button
            variant="ghost"
            onClick={handlePrevious}
            disabled={isFirstStep}
          >
            Previous
          </Button>
          
          <div className="flex space-x-3">
            <Button variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            {isLastStep ? (
              <Button
                variant="primary"
                onClick={handleSubmit}
                isLoading={isSubmitting}
              >
                Save Entry
              </Button>
            ) : (
              <Button variant="primary" onClick={handleNext}>
                Next
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}; 