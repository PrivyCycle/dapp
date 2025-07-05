import type { LogEntry, CycleData, Prediction } from '../types/cycle';

const DB_NAME = 'ConsentCycleDB';
const DB_VERSION = 1;

// Store names
const STORES = {
  LOG_ENTRIES: 'logEntries',
  CYCLE_DATA: 'cycleData',
  PREDICTIONS: 'predictions'
} as const;

class IndexedDbService {
  private db: IDBDatabase | null = null;

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
          const logStore = db.createObjectStore(STORES.LOG_ENTRIES, { keyPath: 'id' });
          logStore.createIndex('date', 'date', { unique: false });
        }

        // Create cycle data store
        if (!db.objectStoreNames.contains(STORES.CYCLE_DATA)) {
          const cycleStore = db.createObjectStore(STORES.CYCLE_DATA, { keyPath: 'id' });
          cycleStore.createIndex('startDate', 'startDate', { unique: false });
        }

        // Create predictions store
        if (!db.objectStoreNames.contains(STORES.PREDICTIONS)) {
          const predictionsStore = db.createObjectStore(STORES.PREDICTIONS, { keyPath: 'id' });
          predictionsStore.createIndex('nextPeriodDate', 'nextPeriodDate', { unique: false });
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

  // Log Entries Operations
  async saveLogEntry(entry: LogEntry): Promise<void> {
    const db = await this.ensureDb();
    const transaction = db.transaction([STORES.LOG_ENTRIES], 'readwrite');
    const store = transaction.objectStore(STORES.LOG_ENTRIES);
    
    return new Promise((resolve, reject) => {
      const request = store.put(entry);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getLogEntries(): Promise<LogEntry[]> {
    const db = await this.ensureDb();
    const transaction = db.transaction([STORES.LOG_ENTRIES], 'readonly');
    const store = transaction.objectStore(STORES.LOG_ENTRIES);
    const index = store.index('date');
    
    return new Promise((resolve, reject) => {
      const request = index.getAll();
      request.onsuccess = () => {
        const entries = request.result.map(entry => ({
          ...entry,
          date: new Date(entry.date) // Convert back to Date object
        }));
        // Sort by date descending (newest first)
        entries.sort((a, b) => b.date.getTime() - a.date.getTime());
        resolve(entries);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async updateLogEntry(id: string, updates: Partial<LogEntry>): Promise<void> {
    const db = await this.ensureDb();
    const transaction = db.transaction([STORES.LOG_ENTRIES], 'readwrite');
    const store = transaction.objectStore(STORES.LOG_ENTRIES);
    
    return new Promise((resolve, reject) => {
      const getRequest = store.get(id);
      getRequest.onsuccess = () => {
        const existingEntry = getRequest.result;
        if (existingEntry) {
          const updatedEntry = { ...existingEntry, ...updates };
          const putRequest = store.put(updatedEntry);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          reject(new Error(`Log entry with id ${id} not found`));
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
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
  async saveCycleData(cycle: CycleData): Promise<void> {
    const db = await this.ensureDb();
    const transaction = db.transaction([STORES.CYCLE_DATA], 'readwrite');
    const store = transaction.objectStore(STORES.CYCLE_DATA);
    
    return new Promise((resolve, reject) => {
      const request = store.put(cycle);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getCycleData(): Promise<CycleData[]> {
    const db = await this.ensureDb();
    const transaction = db.transaction([STORES.CYCLE_DATA], 'readonly');
    const store = transaction.objectStore(STORES.CYCLE_DATA);
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        const cycles = request.result.map(cycle => ({
          ...cycle,
          startDate: new Date(cycle.startDate),
          endDate: cycle.endDate ? new Date(cycle.endDate) : undefined
        }));
        resolve(cycles);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Predictions Operations
  async savePrediction(prediction: Prediction & { id: string }): Promise<void> {
    const db = await this.ensureDb();
    const transaction = db.transaction([STORES.PREDICTIONS], 'readwrite');
    const store = transaction.objectStore(STORES.PREDICTIONS);
    
    return new Promise((resolve, reject) => {
      const request = store.put(prediction);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getPredictions(): Promise<(Prediction & { id: string })[]> {
    const db = await this.ensureDb();
    const transaction = db.transaction([STORES.PREDICTIONS], 'readonly');
    const store = transaction.objectStore(STORES.PREDICTIONS);
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        const predictions = request.result.map(prediction => ({
          ...prediction,
          nextPeriodDate: new Date(prediction.nextPeriodDate),
          ovulationDate: new Date(prediction.ovulationDate),
          fertileWindow: {
            start: new Date(prediction.fertileWindow.start),
            end: new Date(prediction.fertileWindow.end)
          }
        }));
        resolve(predictions);
      };
      request.onerror = () => reject(request.error);
    });
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
export const indexedDbService = new IndexedDbService(); 