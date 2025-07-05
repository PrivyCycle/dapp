import React from 'react';
import { Modal } from '../ui/Modal';
import { Card, CardContent } from '../ui/Card';
import { type LogEntry } from '../../lib/types/cycle';

interface LogEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: LogEntry | null;
}

export const LogEntryModal: React.FC<LogEntryModalProps> = ({
  isOpen,
  onClose,
  entry
}) => {
  if (!entry) return null;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatFlow = (flow: string) => {
    return flow.charAt(0).toUpperCase() + flow.slice(1);
  };

  const formatSymptom = (symptom: string) => {
    return symptom.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatMood = (mood: string) => {
    return mood.charAt(0).toUpperCase() + mood.slice(1);
  };

  const getEnergyLevelText = (level: number) => {
    const levels = {
      1: 'Very Low',
      2: 'Low',
      3: 'Moderate',
      4: 'High',
      5: 'Very High'
    };
    return levels[level as keyof typeof levels] || 'Unknown';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Log Entry Details"
      size="lg"
    >
      <div className="space-y-6">
        {/* Date */}
        <div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            {formatDate(entry.date)}
          </h3>
        </div>

        {/* Flow */}
        {entry.flow && (
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-error/10 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-text-primary">Flow</div>
                  <div className="text-text-secondary">{formatFlow(entry.flow)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Mood */}
        {entry.mood && (
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-accent-primary/10 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-text-primary">Mood</div>
                  <div className="text-text-secondary">{formatMood(entry.mood)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Energy Level */}
        {entry.energyLevel && (
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-success/10 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-text-primary">Energy Level</div>
                  <div className="text-text-secondary">
                    {getEnergyLevelText(entry.energyLevel)} ({entry.energyLevel}/5)
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Symptoms */}
        {entry.symptoms && entry.symptoms.length > 0 && (
          <Card>
            <CardContent className="py-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-warning/10 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-text-primary mb-2">Symptoms</div>
                  <div className="flex flex-wrap gap-2">
                    {entry.symptoms.map((symptom, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning/10 text-warning"
                      >
                        {formatSymptom(symptom)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notes */}
        {entry.notes && (
          <Card>
            <CardContent className="py-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-text-muted/10 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-text-primary mb-2">Notes</div>
                  <div className="text-text-secondary whitespace-pre-wrap">
                    {entry.notes}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Modal>
  );
}; 