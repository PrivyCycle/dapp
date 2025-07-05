import { indexedDbService } from './indexedDBService';
import type { LogEntry } from '../types/cycle';

export class DataManager {
  // Export data to JSON for backup
  static async exportData(): Promise<string> {
    const logEntries = await indexedDbService.getLogEntries();
    const cycleData = await indexedDbService.getCycleData();
    const predictions = await indexedDbService.getPredictions();
    
    const exportData = {
      logEntries,
      cycleData,
      predictions,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    
    return JSON.stringify(exportData, null, 2);
  }
  
  // Import data from JSON backup
  static async importData(jsonData: string): Promise<void> {
    const data = JSON.parse(jsonData);
    
    // Clear existing data
    await indexedDbService.clearAllData();
    
    // Import log entries
    if (data.logEntries && Array.isArray(data.logEntries)) {
      for (const entry of data.logEntries) {
        await indexedDbService.saveLogEntry({
          ...entry,
          date: new Date(entry.date)
        });
      }
    }
    
    // Import cycle data
    if (data.cycleData && Array.isArray(data.cycleData)) {
      for (const cycle of data.cycleData) {
        await indexedDbService.saveCycleData({
          ...cycle,
          startDate: new Date(cycle.startDate),
          endDate: cycle.endDate ? new Date(cycle.endDate) : undefined
        });
      }
    }
    
    // Import predictions
    if (data.predictions && Array.isArray(data.predictions)) {
      for (const prediction of data.predictions) {
        await indexedDbService.savePrediction({
          ...prediction,
          nextPeriodDate: new Date(prediction.nextPeriodDate),
          ovulationDate: new Date(prediction.ovulationDate),
          fertileWindow: {
            start: new Date(prediction.fertileWindow.start),
            end: new Date(prediction.fertileWindow.end)
          }
        });
      }
    }
  }
  
  // Get data statistics
  static async getDataStats(): Promise<{
    logEntriesCount: number;
    cycleDataCount: number;
    predictionsCount: number;
    oldestEntry: Date | null;
    newestEntry: Date | null;
  }> {
    const logEntries = await indexedDbService.getLogEntries();
    const cycleData = await indexedDbService.getCycleData();
    const predictions = await indexedDbService.getPredictions();
    
    const dates = logEntries.map(entry => entry.date);
    const oldestEntry = dates.length > 0 ? new Date(Math.min(...dates.map(d => d.getTime()))) : null;
    const newestEntry = dates.length > 0 ? new Date(Math.max(...dates.map(d => d.getTime()))) : null;
    
    return {
      logEntriesCount: logEntries.length,
      cycleDataCount: cycleData.length,
      predictionsCount: predictions.length,
      oldestEntry,
      newestEntry
    };
  }
  
  // Create sample data for testing
  static async createSampleData(): Promise<void> {
    const sampleEntries: Omit<LogEntry, 'id'>[] = [
      {
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        flow: 'medium',
        symptoms: ['cramps', 'fatigue'],
        mood: 'tired',
        energyLevel: 2,
        notes: 'Period started today'
      },
      {
        date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
        flow: 'heavy',
        symptoms: ['cramps', 'headache'],
        mood: 'irritable',
        energyLevel: 1,
        notes: 'Heavy flow day'
      },
      {
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        flow: 'light',
        symptoms: ['bloating'],
        mood: 'calm',
        energyLevel: 3,
        notes: 'Feeling better'
      }
    ];
    
    for (const entry of sampleEntries) {
      await indexedDbService.saveLogEntry({
        ...entry,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
      });
    }
  }
  
  // Clear all data
  static async clearAllData(): Promise<void> {
    await indexedDbService.clearAllData();
  }
}

// Add to window for debugging in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as typeof window & {
    DataManager: typeof DataManager;
    indexedDbService: typeof indexedDbService;
  }).DataManager = DataManager;
  (window as typeof window & {
    DataManager: typeof DataManager;
    indexedDbService: typeof indexedDbService;
  }).indexedDbService = indexedDbService;
} 