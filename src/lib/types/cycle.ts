export interface CycleData {
  id: string;
  userId: string;
  startDate: Date;
  endDate?: Date;
  cycleLength: number;
  periodLength: number;
  phase: CyclePhase;
  dayOfCycle: number;
}

export type CyclePhase = 'menstrual' | 'follicular' | 'ovulation' | 'luteal';

export interface LogEntry {
  id: string;
  date: Date;
  flow?: FlowIntensity;
  symptoms: Symptom[];
  mood?: Mood;
  notes?: string;
  energyLevel?: number; // 1-5 scale
}

export type FlowIntensity = 'spotting' | 'light' | 'medium' | 'heavy';

export type Symptom = 
  | 'cramps'
  | 'headache'
  | 'bloating'
  | 'breast_tenderness'
  | 'mood_swings'
  | 'fatigue'
  | 'nausea'
  | 'back_pain'
  | 'acne'
  | 'food_cravings';

export type Mood = 'happy' | 'sad' | 'irritable' | 'anxious' | 'energetic' | 'tired' | 'calm';

export interface CycleInsight {
  id: string;
  type: 'pattern' | 'prediction' | 'health' | 'tip';
  title: string;
  description: string;
  confidence: number; // 0-1
  date: Date;
}
// make sure that the predictions are multi-facet


export interface Prediction {
  nextPeriodDate: Date;
  ovulationDate: Date;
  fertileWindow: {
    start: Date;
    end: Date;
  };
  confidence: number;
}


