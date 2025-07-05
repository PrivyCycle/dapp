import { useState, useEffect } from 'react';
import type { LogEntry, FlowIntensity, Symptom, Mood } from '../../lib/types/cycle';

// Mock log entries for demonstration
const mockLogEntries: LogEntry[] = [
  {
    id: '1',
    date: new Date(2025, 2, 5), // March 5, 2025
    flow: 'medium',
    symptoms: ['cramps', 'fatigue'],
    mood: 'tired',
    notes: 'First day of period, feeling tired but manageable',
    energyLevel: 2
  },
  {
    id: '2',
    date: new Date(2025, 2, 6), // March 6, 2025
    flow: 'heavy',
    symptoms: ['cramps', 'headache', 'bloating'],
    mood: 'irritable',
    notes: 'Heavy flow day, need extra rest',
    energyLevel: 2
  },
  {
    id: '3',
    date: new Date(2025, 2, 7), // March 7, 2025
    flow: 'medium',
    symptoms: ['cramps'],
    mood: 'calm',
    energyLevel: 3
  },
  {
    id: '4',
    date: new Date(2025, 2, 12), // March 12, 2025
    symptoms: ['breast_tenderness'],
    mood: 'energetic',
    notes: 'Feeling great, lots of energy today',
    energyLevel: 4
  },
  {
    id: '5',
    date: new Date(2025, 2, 18), // March 18, 2025
    symptoms: ['mood_swings'],
    mood: 'happy',
    notes: 'Ovulation time - feeling confident and social',
    energyLevel: 5
  }
];

export const useLogEntries = (): {
  entries: LogEntry[];
  addEntry: (entry: Omit<LogEntry, 'id'>) => void;
  updateEntry: (id: string, entry: Partial<LogEntry>) => void;
  deleteEntry: (id: string) => void;
  isLoading: boolean;
  error: string | null;
} => {
  const [entries, setEntries] = useState<LogEntry[]>(mockLogEntries);
  const [isLoading, setIsLoading] = useState(true);
  const [error, _setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const addEntry = (entry: Omit<LogEntry, 'id'>): void => {
    const newEntry: LogEntry = {
      ...entry,
      id: Date.now().toString()
    };
    setEntries(prev => [newEntry, ...prev]);
  };

  const updateEntry = (id: string, updatedEntry: Partial<LogEntry>): void => {
    setEntries(prev => 
      prev.map(entry => 
        entry.id === id ? { ...entry, ...updatedEntry } : entry
      )
    );
  };

  const deleteEntry = (id: string): void => {
    setEntries(prev => prev.filter(entry => entry.id !== id));
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
