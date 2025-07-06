import type { LogEntry, CycleData, Prediction } from '../types/cycle';
import { PrivyEncryptionService, type EncryptedData } from '../encryption/privyEncryption';

const DB_NAME = 'ConsentCycleDB';
const DB_VERSION = 1;

// Store names
const STORES = {
  LOG_ENTRIES: 'logEntries',
  CYCLE_DATA: 'cycleData',
  PREDICTIONS: 'predictions'
} as const;

// Interface for encrypted storage record
interface EncryptedRecord {
  id: string;
  encryptedData: EncryptedData;
}

class EncryptedIndexedDbService {
  private db: IDBDatabase | null = null;
  private encryptionService: PrivyEncryptionService;

  constructor() {
    this.encryptionService = new PrivyEncryptionService();
  }

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result as IDBDatabase;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create log entries store
        if (!db.objectStoreNames.contains(STORES.LOG_ENTRIES)) {
          db.createObjectStore(STORES.LOG_ENTRIES, { keyPath: 'id' });
          // Note: We don't index encrypted data as it's not searchable
        }

        // Create cycle data store
        if (!db.objectStoreNames.contains(STORES.CYCLE_DATA)) {
          db.createObjectStore(STORES.CYCLE_DATA, { keyPath: 'id' });
        }

        // Create predictions store
        if (!db.objectStoreNames.contains(STORES.PREDICTIONS)) {
          db.createObjectStore(STORES.PREDICTIONS, { keyPath: 'id' });
        }
      };
    });
  }

  private async ensureDb(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.init();
    }
    return this.db!;
  }

  // Helper method to encrypt and store data
  private async encryptAndStore<T>(
    data: T,
    storeName: string,
    userId: string
  ): Promise<void> {
    // Serialize and encrypt the data BEFORE creating the transaction
    const serializedData = JSON.stringify(data);
    const encryptedData = await this.encryptionService.encrypt(serializedData, userId);
    
    // Create the encrypted record
    const record: EncryptedRecord = {
      id: (data as { id: string }).id,
      encryptedData
    };
    
    // Now create the transaction and store the pre-encrypted data
    const db = await this.ensureDb();
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    
    return new Promise((resolve, reject) => {
      const request = store.put(record);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Helper method to retrieve and decrypt data
  private async retrieveAndDecrypt<T>(
    storeName: string,
    userId: string
  ): Promise<T[]> {
    const db = await this.ensureDb();
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = async () => {
        try {
          const encryptedRecords: EncryptedRecord[] = request.result;
          const decryptedData: T[] = [];
          
          for (const record of encryptedRecords) {
            try {
              const decryptedJson = await this.encryptionService.decrypt(record.encryptedData, userId);
              const parsedData = JSON.parse(decryptedJson);
              
              // Convert date strings back to Date objects for LogEntry
              if (storeName === STORES.LOG_ENTRIES && parsedData.date) {
                parsedData.date = new Date(parsedData.date);
              }
              
              // Convert date strings back to Date objects for CycleData
              if (storeName === STORES.CYCLE_DATA) {
                if (parsedData.startDate) parsedData.startDate = new Date(parsedData.startDate);
                if (parsedData.endDate) parsedData.endDate = new Date(parsedData.endDate);
              }
              
              // Convert date strings back to Date objects for Predictions
              if (storeName === STORES.PREDICTIONS) {
                if (parsedData.nextPeriodDate) parsedData.nextPeriodDate = new Date(parsedData.nextPeriodDate);
                if (parsedData.ovulationDate) parsedData.ovulationDate = new Date(parsedData.ovulationDate);
                if (parsedData.fertileWindow) {
                  parsedData.fertileWindow.start = new Date(parsedData.fertileWindow.start);
                  parsedData.fertileWindow.end = new Date(parsedData.fertileWindow.end);
                }
              }
              
              decryptedData.push(parsedData);
            } catch (decryptError) {
              console.warn(`Failed to decrypt record ${record.id}:`, decryptError);
              // Continue with other records
            }
          }
          
          // Sort log entries by date if applicable
          if (storeName === STORES.LOG_ENTRIES) {
            decryptedData.sort((a, b) => (b as LogEntry).date.getTime() - (a as LogEntry).date.getTime());
          }
          
          resolve(decryptedData);
        } catch (error) {
          reject(error);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Log Entries Operations
  async saveLogEntry(
    entry: LogEntry,
    userId: string
  ): Promise<void> {
    return this.encryptAndStore(entry, STORES.LOG_ENTRIES, userId);
  }

  async getLogEntries(
    userId: string
  ): Promise<LogEntry[]> {
    return this.retrieveAndDecrypt<LogEntry>(STORES.LOG_ENTRIES, userId);
  }

  async updateLogEntry(
    id: string,
    updates: Partial<LogEntry>,
    userId: string
  ): Promise<void> {
    // Get existing entry
    const entries = await this.getLogEntries(userId);
    const existingEntry = entries.find(entry => entry.id === id);
    
    if (!existingEntry) {
      throw new Error(`Log entry with id ${id} not found`);
    }
    
    // Update and save
    const updatedEntry = { ...existingEntry, ...updates };
    return this.saveLogEntry(updatedEntry, userId);
  }

  async deleteLogEntry(id: string): Promise<void> {
    const db = await this.ensureDb();
    const transaction = db.transaction([STORES.LOG_ENTRIES], 'readwrite');
    const store = transaction.objectStore(STORES.LOG_ENTRIES);
    
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Cycle Data Operations
  async saveCycleData(
    cycle: CycleData,
    userId: string
  ): Promise<void> {
    return this.encryptAndStore(cycle, STORES.CYCLE_DATA, userId);
  }

  async getCycleData(
    userId: string
  ): Promise<CycleData[]> {
    return this.retrieveAndDecrypt<CycleData>(STORES.CYCLE_DATA, userId);
  }

  // Predictions Operations
  async savePrediction(
    prediction: Prediction & { id: string },
    userId: string
  ): Promise<void> {
    return this.encryptAndStore(prediction, STORES.PREDICTIONS, userId);
  }

  async getPredictions(
    userId: string
  ): Promise<(Prediction & { id: string })[]> {
    return this.retrieveAndDecrypt<Prediction & { id: string }>(STORES.PREDICTIONS, userId);
  }

  // Utility method to clear all data (for testing/reset)
  async clearAllData(): Promise<void> {
    const db = await this.ensureDb();
    const transaction = db.transaction([STORES.LOG_ENTRIES, STORES.CYCLE_DATA, STORES.PREDICTIONS], 'readwrite');
    
    const promises = [
      new Promise<void>((resolve, reject) => {
        const request = transaction.objectStore(STORES.LOG_ENTRIES).clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      }),
      new Promise<void>((resolve, reject) => {
        const request = transaction.objectStore(STORES.CYCLE_DATA).clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      }),
      new Promise<void>((resolve, reject) => {
        const request = transaction.objectStore(STORES.PREDICTIONS).clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      })
    ];

    await Promise.all(promises);
  }

}

// Export a singleton instance
export const encryptedIndexedDbService = new EncryptedIndexedDbService();
