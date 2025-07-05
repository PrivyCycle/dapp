import { useState, useEffect } from 'react';
import { indexedDbService } from '../../lib/storage/indexedDBService';
import type { CycleData, CyclePhase, Prediction } from '../../lib/types/cycle';

export const useCycleData = (): {
  currentCycle: CycleData | null;
  prediction: Prediction | null;
  isLoading: boolean;
  error: string | null;
} => {
  const [currentCycle, setCurrentCycle] = useState<CycleData | null>(null);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCycleData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Load cycle data from IndexedDB
        const cycles = await indexedDbService.getCycleData();
        const predictions = await indexedDbService.getPredictions();
        
        // Get the most recent cycle
        const mostRecentCycle = cycles.length > 0 ? cycles[cycles.length - 1] : null;
        setCurrentCycle(mostRecentCycle);
        
        // Get the most recent prediction
        const mostRecentPrediction = predictions.length > 0 ? predictions[predictions.length - 1] : null;
        setPrediction(mostRecentPrediction);
        
      } catch (err) {
        console.error('Error loading cycle data:', err);
        setError('Failed to load cycle data');
      } finally {
        setIsLoading(false);
      }
    };

    loadCycleData();
  }, []);

  return {
    currentCycle,
    prediction,
    isLoading,
    error
  };
};

export const getCyclePhaseInfo = (phase?: CyclePhase): {
  name: string;
  description: string;
  color: string;
} => {
  if (!phase) {
    return {
      name: 'Unknown',
      description: 'No cycle data available',
      color: 'text-text-muted'
    };
  }

  const phaseInfo = {
    menstrual: {
      name: 'Menstrual',
      description: 'Your period is here. Focus on rest and self-care.',
      color: 'text-error'
    },
    follicular: {
      name: 'Follicular',
      description: 'Energy is building. Great time for new projects.',
      color: 'text-accent-primary'
    },
    ovulation: {
      name: 'Ovulation',
      description: 'Peak energy and fertility. You might feel most confident.',
      color: 'text-success'
    },
    luteal: {
      name: 'Luteal',
      description: 'Energy may be winding down. Time for reflection.',
      color: 'text-warning'
    }
  };

  return phaseInfo[phase];
};

export const getDaysUntilNextPeriod = (prediction: Prediction | null): number => {
  if (!prediction) return 0;
  const today = new Date();
  const nextPeriod = prediction.nextPeriodDate;
  const diffTime = nextPeriod.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};
