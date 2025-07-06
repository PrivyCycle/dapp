import { useState, useEffect, useCallback } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { encryptedIndexedDbService } from '../../lib/storage/encryptedIndexedDBService';
import { usePrivyEncryption } from '../../lib/encryption/privyEncryption';
import type { LogEntry, FlowIntensity, Symptom, Mood } from '../../lib/types/cycle';

export const useEncryptedLogEntries = () => {
  const { user, authenticated, ready } = usePrivy();
  const { isReady: encryptionReady } = usePrivyEncryption();
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize the database
  useEffect(() => {
    const initDb = async () => {
      try {
        await encryptedIndexedDbService.init();
      } catch (err) {
        console.error('Failed to initialize database:', err);
        setError('Failed to initialize database');
      }
    };

    initDb();
  }, []);

  // Load entries when user is authenticated and encryption is ready
  const loadEntries = useCallback(async () => {
    if (!authenticated || !user?.id || !encryptionReady) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const loadedEntries = await encryptedIndexedDbService.getLogEntries(user.id);
      setEntries(loadedEntries);
      setIsInitialized(true);
    } catch (err) {
      console.error('Failed to load entries:', err);
      setError(err instanceof Error ? err.message : 'Failed to load entries');
    } finally {
      setIsLoading(false);
    }
  }, [authenticated, user?.id, encryptionReady]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const addEntry = useCallback(async (entry: Omit<LogEntry, 'id'>) => {
    if (!authenticated || !user?.id || !encryptionReady) {
      throw new Error('User must be authenticated and encryption ready');
    }

    const newEntry: LogEntry = {
      ...entry,
      id: crypto.randomUUID(),
    };

    try {
      await encryptedIndexedDbService.saveLogEntry(newEntry, user.id);
      setEntries(prev => [newEntry, ...prev].sort((a, b) => b.date.getTime() - a.date.getTime()));
    } catch (err) {
      console.error('Failed to add entry:', err);
      throw err;
    }
  }, [authenticated, user?.id, encryptionReady]);

  const updateEntry = useCallback(async (id: string, updates: Partial<LogEntry>) => {
    if (!authenticated || !user?.id || !encryptionReady) {
      throw new Error('User must be authenticated and encryption ready');
    }

    try {
      await encryptedIndexedDbService.updateLogEntry(id, updates, user.id);
      
      // Update local state
      setEntries(prev => 
        prev.map(entry => 
          entry.id === id ? { ...entry, ...updates } : entry
        ).sort((a, b) => b.date.getTime() - a.date.getTime())
      );
    } catch (err) {
      console.error('Failed to update entry:', err);
      throw err;
    }
  }, [authenticated, user?.id, encryptionReady]);

  const deleteEntry = useCallback(async (id: string) => {
    if (!authenticated || !user?.id) {
      throw new Error('User must be authenticated');
    }

    try {
      await encryptedIndexedDbService.deleteLogEntry(id);
      setEntries(prev => prev.filter(entry => entry.id !== id));
    } catch (err) {
      console.error('Failed to delete entry:', err);
      throw err;
    }
  }, [authenticated, user?.id]);

  const getEntriesForDateRange = useCallback((startDate: Date, endDate: Date) => {
    return entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= startDate && entryDate <= endDate;
    });
  }, [entries]);

  const getEntriesForDate = useCallback((date: Date) => {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    return entries.filter(entry => {
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);
      return entryDate.getTime() === targetDate.getTime();
    });
  }, [entries]);

  const getLatestEntry = useCallback(() => {
    return entries.length > 0 ? entries[0] : null;
  }, [entries]);

  const getEntriesByType = useCallback((filterFn: (entry: LogEntry) => boolean) => {
    return entries.filter(filterFn);
  }, [entries]);

  const hasEntryForDate = useCallback((date: Date) => {
    return getEntriesForDate(date).length > 0;
  }, [getEntriesForDate]);

  const clearAllEntries = useCallback(async () => {
    if (!authenticated || !user?.id) {
      throw new Error('User must be authenticated');
    }

    try {
      await encryptedIndexedDbService.clearAllData();
      setEntries([]);
    } catch (err) {
      console.error('Failed to clear entries:', err);
      throw err;
    }
  }, [authenticated, user?.id]);

  // Clear state on logout
  useEffect(() => {
    if (!authenticated) {
      setEntries([]);
      setError(null);
      setIsInitialized(false);
    }
  }, [authenticated]);

  // Initialize data when ready
  const initializeData = useCallback(async () => {
    return loadEntries();
  }, [loadEntries]);

  // Refresh data
  const refreshData = useCallback(async () => {
    return loadEntries();
  }, [loadEntries]);

  // Check if wallet is ready
  const isWalletReady = useCallback(() => {
    return ready && authenticated && encryptionReady && !!user?.id;
  }, [ready, authenticated, encryptionReady, user?.id]);

  // Clear cache (no-op since we don't have cache anymore)
  const clearCache = useCallback(() => {
    // No-op - encryption service doesn't have cache anymore
  }, []);

  // Clear storage and retry
  const clearStorageAndRetry = useCallback(async () => {
    try {
      await encryptedIndexedDbService.clearAllData();
      setEntries([]);
      setError(null);
      setIsInitialized(false);
      await loadEntries();
    } catch (err) {
      console.error('Error clearing storage:', err);
      setError('Failed to clear storage');
    }
  }, [loadEntries]);

  return {
    entries,
    addEntry,
    updateEntry,
    deleteEntry,
    isLoading,
    error,
    isInitialized,
    initializeData,
    refreshData,
    clearCache,
    clearStorageAndRetry,
    isWalletReady,
    getEntriesForDateRange,
    getEntriesForDate,
    getLatestEntry,
    getEntriesByType,
    hasEntryForDate,
    clearAllEntries,
    isReady: ready && authenticated && encryptionReady && !!user?.id,
  };
};

// Re-export helper functions
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
