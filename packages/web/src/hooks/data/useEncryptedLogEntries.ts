import { useState, useEffect, useRef } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { encryptedIndexedDbService } from '../../lib/storage/encryptedIndexedDBService';
import type { LogEntry, FlowIntensity, Symptom, Mood } from '../../lib/types/cycle';

export const useEncryptedLogEntries = (): {
  entries: LogEntry[];
  addEntry: (entry: Omit<LogEntry, 'id'>) => Promise<void>;
  updateEntry: (id: string, entry: Partial<LogEntry>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
  initializeData: () => Promise<void>;
  refreshData: () => Promise<void>;
  clearCache: () => void;
  clearStorageAndRetry: () => Promise<void>;
  isWalletReady: () => boolean;
} => {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const loadingRef = useRef(false);
  const initCheckRef = useRef(false);
  
  const { signMessage, user, authenticated, ready } = usePrivy();

  // Generate a more robust unique ID
  const generateId = (): string => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };


  // Manual initialization function (loads fresh data from database)
  const initializeData = async (): Promise<void> => {
    if (loadingRef.current || isInitialized) {
      return;
    }

    console.log('🚀 Initializing encrypted data...');
    
    if (!ready || !authenticated || !user?.id || !signMessage) {
      throw new Error('Please ensure you are authenticated and wallet is ready');
    }

    try {
      loadingRef.current = true;
      setIsLoading(true);
      setError(null);
      
      console.log('🔄 Loading encrypted entries for user:', user.id);
      
      const adaptedSignMessage = async (message: { message: string }): Promise<{ signature: string }> => {
        try {
          const result = await signMessage(message);
          return result;
        } catch (error) {
          console.error('Failed to sign message during data loading:', error);
          throw error;
        }
      };
      
      const savedEntries = await encryptedIndexedDbService.getLogEntries(user.id, adaptedSignMessage);
      console.log('✅ Successfully loaded', savedEntries.length, 'entries');
      setEntries(savedEntries);
      setIsInitialized(true);
    } catch (err) {
      console.error('❌ Error initializing data:', err);
      
      if (err instanceof Error) {
        if (err.message.includes('Unable to connect to wallet') || 
            err.message.includes('Exceeded max attempts')) {
          setError('Wallet connection failed. Please try again.');
        } else if (err.message.includes('Decryption failed')) {
          setError('Unable to decrypt existing data. Your wallet may have changed.');
        } else {
          setError(err.message);
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      throw err;
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
    }
  };

  // Check if wallet is ready for operations
  const isWalletReady = (): boolean => {
    return !!(
      authenticated && 
      ready && 
      user?.id && 
      typeof signMessage === 'function' && 
      user?.wallet?.address
    );
  };

  // Clear state when user logs out
  useEffect(() => {
    if (!authenticated) {
      console.log('🔄 User logged out, clearing state...');
      setEntries([]);
      setIsInitialized(false);
      setError(null);
      setIsLoading(false);
      initCheckRef.current = false;
    }
  }, [authenticated]);

  const addEntry = async (entry: Omit<LogEntry, 'id'>): Promise<void> => {
    if (!ready || !authenticated || !user?.id || !signMessage) {
      throw new Error('User not authenticated');
    }

    if (!isInitialized) {
      throw new Error('Data not initialized. Please initialize first.');
    }
    
    try {
      const newEntry: LogEntry = {
        ...entry,
        id: generateId() // Use more robust ID generation
      };
      
      const adaptedSignMessage = async (message: { message: string }): Promise<{ signature: string }> => {
        return await signMessage(message);
      };
      
      console.log('💾 Saving new entry with ID:', newEntry.id);
      await encryptedIndexedDbService.saveLogEntry(newEntry, user.id, adaptedSignMessage);
      console.log('✅ Entry saved successfully');
      setEntries(prev => {
        console.log('📝 Adding entry to state. Previous count:', prev.length);
        const newEntries = [newEntry, ...prev];
        console.log('📝 New count:', newEntries.length);
        return newEntries;
      });
    } catch (err) {
      console.error('❌ Error adding log entry:', err);
      
      if (err instanceof Error && (err.message.includes('Unable to connect to wallet') || 
          err.message.includes('Exceeded max attempts'))) {
        setError('Wallet connection failed. Please try again.');
      } else {
        setError('Failed to save log entry');
      }
      throw err;
    }
  };

  const updateEntry = async (id: string, updatedEntry: Partial<LogEntry>): Promise<void> => {
    if (!ready || !authenticated || !user?.id || !signMessage) {
      throw new Error('User not authenticated');
    }

    if (!isInitialized) {
      throw new Error('Data not initialized. Please initialize first.');
    }
    
    try {
      const adaptedSignMessage = async (message: { message: string }): Promise<{ signature: string }> => {
        return await signMessage(message);
      };
      
      await encryptedIndexedDbService.updateLogEntry(id, updatedEntry, user.id, adaptedSignMessage);
      setEntries(prev => 
        prev.map(entry => 
          entry.id === id ? { ...entry, ...updatedEntry } : entry
        )
      );
    } catch (err) {
      console.error('Error updating log entry:', err);
      
      if (err instanceof Error && (err.message.includes('Unable to connect to wallet') || 
          err.message.includes('Exceeded max attempts'))) {
        setError('Wallet connection failed. Please try again.');
      } else {
        setError('Failed to update log entry');
      }
      throw err;
    }
  };

  const deleteEntry = async (id: string): Promise<void> => {
    if (!isInitialized) {
      throw new Error('Data not initialized. Please initialize first.');
    }

    try {
      await encryptedIndexedDbService.deleteLogEntry(id);
      setEntries(prev => prev.filter(entry => entry.id !== id));
    } catch (err) {
      console.error('Error deleting log entry:', err);
      setError('Failed to delete log entry');
      throw err;
    }
  };

  const clearCache = () => {
    encryptedIndexedDbService.clearEncryptionCache();
  };

  const clearStorageAndRetry = async () => {
    try {
      await encryptedIndexedDbService.clearAllData();
      encryptedIndexedDbService.clearEncryptionCache();
      setEntries([]);
      setError(null);
      setIsInitialized(false);
      initCheckRef.current = false;
    } catch (err) {
      console.error('Error clearing storage:', err);
      setError('Failed to clear storage');
    }
  };

  // Refresh function to reload data (similar to initializeData but without guards)
  const refreshData = async (): Promise<void> => {
    if (!ready || !authenticated || !user?.id || !signMessage) {
      console.warn('Cannot refresh data: user not ready');
      return;
    }

    try {
      console.log('🔄 Refreshing encrypted entries for user:', user.id);
      setIsLoading(true);
      
      const adaptedSignMessage = async (message: { message: string }): Promise<{ signature: string }> => {
        return await signMessage(message);
      };
      
      const savedEntries = await encryptedIndexedDbService.getLogEntries(user.id, adaptedSignMessage);
      console.log('✅ Successfully refreshed', savedEntries.length, 'entries');
      setEntries(savedEntries);
      setError(null);
    } catch (err) {
      console.error('❌ Error refreshing data:', err);
      if (err instanceof Error) {
        setError('Failed to refresh data: ' + err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

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
    isWalletReady
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
