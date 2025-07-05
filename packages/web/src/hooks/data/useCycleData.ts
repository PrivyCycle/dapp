import { useState, useEffect } from 'react';
import type { CycleData, CyclePhase, Prediction } from '../../lib/types/cycle';

export const useCycleData = (): {
  currentCycle: CycleData | null;
  prediction: Prediction | null;
  isLoading: boolean;
  error: string | null;
} => {
  const [currentCycle] = useState<CycleData | null>(null);
  const [prediction] = useState<Prediction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error] = useState<string | null>(null);

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
