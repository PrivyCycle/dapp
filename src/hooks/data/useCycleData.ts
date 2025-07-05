import { useState, useEffect } from 'react';
import type { CycleData, CyclePhase, Prediction } from '../../lib/types/cycle';

// Mock data for demonstration
const mockCycleData: CycleData = {
  id: '1',
  userId: 'user1',
  startDate: new Date(2025, 2, 5), // March 5, 2025
  cycleLength: 28,
  periodLength: 5,
  phase: 'ovulation',
  dayOfCycle: 14
};

const mockPrediction: Prediction = {
  nextPeriodDate: new Date(2025, 3, 2), // April 2, 2025
  ovulationDate: new Date(2025, 2, 19), // March 19, 2025
  fertileWindow: {
    start: new Date(2025, 2, 17), // March 17, 2025
    end: new Date(2025, 2, 21)   // March 21, 2025
  },
  confidence: 0.85
};

export const useCycleData = (): {
  currentCycle: CycleData;
  prediction: Prediction;
  isLoading: boolean;
  error: string | null;
} => {
  const [currentCycle, _setCurrentCycle] = useState<CycleData>(mockCycleData);
  const [prediction, _setPrediction] = useState<Prediction>(mockPrediction);
  const [isLoading, setIsLoading] = useState(true);
  const [error, _setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return {
    currentCycle,
    prediction,
    isLoading,
    error
  };
};

export const getCyclePhaseInfo = (phase: CyclePhase): {
  name: string;
  description: string;
  color: string;
} => {
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

export const getDaysUntilNextPeriod = (prediction: Prediction): number => {
  const today = new Date();
  const nextPeriod = prediction.nextPeriodDate;
  const diffTime = nextPeriod.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};
