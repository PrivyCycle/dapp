import React from 'react';
import { Modal } from '../ui/Modal';
import { Card, CardContent } from '../ui/Card';
import { type LogEntry } from '../../lib/types/cycle';

interface AllEntriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: LogEntry[];
  onEntryClick: (entry: LogEntry) => void;
}

export const AllEntriesModal: React.FC<AllEntriesModalProps> = ({
  isOpen,
  onClose,
  entries,
  onEntryClick
}) => {
  // Sort entries by date, newest first
  const sortedEntries = [...entries].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatRelativeDate = (date: Date) => {
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  const getFlowColor = (flow: string) => {
    const colors = {
      spotting: 'text-text-muted',
      light: 'text-accent-primary',
      medium: 'text-warning',
      heavy: 'text-error'
    };
    return colors[flow as keyof typeof colors] || 'text-text-primary';
  };

  const getMoodEmoji = (mood: string) => {
    const emojis = {
      happy: '😊',
      energetic: '⚡',
      calm: '😌',
      tired: '😴',
      sad: '😢',
      irritable: '😤',
      anxious: '😰'
    };
    return emojis[mood as keyof typeof emojis] || '😐';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="All Log Entries"
      size="xl"
    >
      <div className="max-h-[70vh] overflow-y-auto">
        {sortedEntries.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">No Entries Yet</h3>
            <p className="text-text-secondary">Start logging your cycle data to see entries here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedEntries.map((entry) => (
              <div 
                key={entry.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => onEntryClick(entry)}
              >
                <Card>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-text-primary">
                          {formatDate(entry.date)}
                        </h3>
                        <p className="text-sm text-text-muted">
                          {formatRelativeDate(entry.date)}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-text-muted">
                          Energy: {entry.energyLevel}/5
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Flow */}
                      {entry.flow && (
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-error/10 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </div>
                          <div>
                            <div className="text-xs text-text-muted">Flow</div>
                            <div className={`text-sm font-medium capitalize ${getFlowColor(entry.flow)}`}>
                              {entry.flow}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Mood */}
                      {entry.mood && (
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-accent-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-lg">{getMoodEmoji(entry.mood)}</span>
                          </div>
                          <div>
                            <div className="text-xs text-text-muted">Mood</div>
                            <div className="text-sm font-medium capitalize text-text-primary">
                              {entry.mood}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Symptoms */}
                      {entry.symptoms && entry.symptoms.length > 0 && (
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-warning/10 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                          </div>
                          <div>
                            <div className="text-xs text-text-muted">Symptoms</div>
                            <div className="text-sm font-medium text-text-primary">
                              {entry.symptoms.length} selected
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Energy */}
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-success/10 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-xs text-text-muted">Energy</div>
                          <div className="text-sm font-medium text-text-primary">
                            {entry.energyLevel}/5
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Notes Preview */}
                    {entry.notes && (
                      <div className="mt-3 p-3 bg-bg-tertiary rounded-lg">
                        <div className="text-xs text-text-muted mb-1">Notes</div>
                        <div className="text-sm text-text-secondary line-clamp-2">
                          {entry.notes.length > 100 
                            ? `${entry.notes.substring(0, 100)}...` 
                            : entry.notes
                          }
                        </div>
                      </div>
                    )}

                    {/* Click hint */}
                    <div className="mt-3 text-xs text-text-muted text-center opacity-70">
                      Click to view details
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}; 