import { useState, useEffect } from 'react';
import { indexedDbService } from '../../lib/storage/indexedDBService';
import type { LogEntry, FlowIntensity, Symptom, Mood } from '../../lib/types/cycle';

export const useLogEntries = (): {
  entries: LogEntry[];
  addEntry: (entry: Omit<LogEntry, 'id'>) => Promise<void>;
  updateEntry: (id: string, entry: Partial<LogEntry>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
} => {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEntries = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const savedEntries = await indexedDbService.getLogEntries();
        setEntries(savedEntries);
      } catch (err) {
        console.error('Error loading log entries:', err);
        setError('Failed to load log entries');
      } finally {
        setIsLoading(false);
      }
    };

    loadEntries();
  }, []);

  const addEntry = async (entry: Omit<LogEntry, 'id'>): Promise<void> => {
    try {
      const newEntry: LogEntry = {
        ...entry,
        id: Date.now().toString()
      };
      
      await indexedDbService.saveLogEntry(newEntry);
      setEntries(prev => [newEntry, ...prev]);
    } catch (err) {
      console.error('Error adding log entry:', err);
      setError('Failed to save log entry');
      throw err;
    }
  };

  const updateEntry = async (id: string, updatedEntry: Partial<LogEntry>): Promise<void> => {
    try {
      await indexedDbService.updateLogEntry(id, updatedEntry);
      setEntries(prev => 
        prev.map(entry => 
          entry.id === id ? { ...entry, ...updatedEntry } : entry
        )
      );
    } catch (err) {
      console.error('Error updating log entry:', err);
      setError('Failed to update log entry');
      throw err;
    }
  };

  const deleteEntry = async (id: string): Promise<void> => {
    try {
      await indexedDbService.deleteLogEntry(id);
      setEntries(prev => prev.filter(entry => entry.id !== id));
    } catch (err) {
      console.error('Error deleting log entry:', err);
      setError('Failed to delete log entry');
      throw err;
    }
  };

  return {
    entries,
    addEntry,
    updateEntry,
    deleteEntry,
    isLoading,
    error
  };
};

export const getFlowIntensityColor = (flow: FlowIntensity): string => {
  const colors = {
    spotting: 'text-text-muted',
    light: 'text-accent-primary',
    medium: 'text-warning',
    heavy: 'text-error'
  };
  return colors[flow];
};

export const getMoodColor = (mood: Mood): string => {
  const colors = {
    happy: 'text-success',
    energetic: 'text-accent-primary',
    calm: 'text-text-primary',
    tired: 'text-text-muted',
    sad: 'text-accent-secondary',
    irritable: 'text-warning',
    anxious: 'text-error'
  };
  return colors[mood];
};

export const getSymptomDisplayName = (symptom: Symptom): string => {
  const displayNames = {
    cramps: 'Cramps',
    headache: 'Headache',
    bloating: 'Bloating',
    breast_tenderness: 'Breast Tenderness',
    mood_swings: 'Mood Swings',
    fatigue: 'Fatigue',
    nausea: 'Nausea',
    back_pain: 'Back Pain',
    acne: 'Acne',
    food_cravings: 'Food Cravings'
  };
  return displayNames[symptom];
};
