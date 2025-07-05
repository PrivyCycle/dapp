import { useState, useEffect } from 'react';
import type { PartnerTip } from '../../lib/types/sharing';
import type { CyclePhase } from '../../lib/types/cycle';

// Mock partner tips for demonstration
const mockPartnerTips: PartnerTip[] = [
  {
    id: '1',
    phase: 'ovulation',
    category: 'activity',
    title: 'Perfect Time for Date Night',
    description: 'Energy levels are at their peak! This is a great time for active dates, trying new restaurants, or planning adventures together.',
    priority: 'high'
  },
  {
    id: '2',
    phase: 'ovulation',
    category: 'communication',
    title: 'Great Time for Important Conversations',
    description: 'Communication tends to be clearest during this phase. Good time for planning future goals or discussing important topics.',
    priority: 'medium'
  },
  {
    id: '3',
    phase: 'luteal',
    category: 'comfort',
    title: 'Extra Comfort Appreciated',
    description: 'Consider cozy nights in, comfort food, and gentle activities. A heating pad or warm bath might be especially appreciated.',
    priority: 'high'
  },
  {
    id: '4',
    phase: 'luteal',
    category: 'support',
    title: 'Practice Extra Patience',
    description: 'Emotions may be more intense. Listen actively, offer support without trying to "fix" things, and be understanding.',
    priority: 'high'
  },
  {
    id: '5',
    phase: 'menstrual',
    category: 'comfort',
    title: 'Focus on Comfort',
    description: 'Hot water bottles, favorite snacks, and low-key activities are perfect. Offer to handle household tasks.',
    priority: 'high'
  },
  {
    id: '6',
    phase: 'menstrual',
    category: 'support',
    title: 'Be Understanding',
    description: 'Energy levels may be lower. Respect the need for rest and avoid scheduling demanding activities.',
    priority: 'medium'
  },
  {
    id: '7',
    phase: 'follicular',
    category: 'activity',
    title: 'Energy is Building',
    description: 'Great time to start new projects together or plan upcoming activities. Motivation and energy are increasing.',
    priority: 'medium'
  }
];

export const usePartnerTips = (currentPhase: CyclePhase): {
  tips: PartnerTip[];
  currentPhaseTips: PartnerTip[];
  isLoading: boolean;
  error: string | null;
} => {
  const [tips, _setTips] = useState<PartnerTip[]>(mockPartnerTips);
  const [isLoading, setIsLoading] = useState(true);
  const [error, _setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  const currentPhaseTips = tips.filter(tip => tip.phase === currentPhase);

  return {
    tips,
    currentPhaseTips,
    isLoading,
    error
  };
};

export const getTipPriorityColor = (priority: 'low' | 'medium' | 'high'): string => {
  const colors = {
    low: 'text-text-muted',
    medium: 'text-warning',
    high: 'text-accent-primary'
  };
  return colors[priority];
};

export const getTipCategoryIcon = (category: 'support' | 'activity' | 'communication' | 'comfort'): string => {
  const icons = {
    support: '🤝',
    activity: '🎯',
    communication: '💬',
    comfort: '🏠'
  };
  return icons[category];
};

export const getPhaseDescription = (phase: CyclePhase): string => {
  const descriptions = {
    menstrual: 'Period phase - focus on comfort and understanding',
    follicular: 'Energy building phase - great for new activities',
    ovulation: 'Peak energy phase - perfect for adventures and important talks',
    luteal: 'Winding down phase - extra patience and comfort appreciated'
  };
  return descriptions[phase];
};
