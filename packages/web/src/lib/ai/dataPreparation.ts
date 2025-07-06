import type { LogEntry, CycleData, CyclePhase } from '../types/cycle';

export interface CycleDataSummary {
  cycleLength: number;
  periodLength: number;
  currentPhase: CyclePhase;
  dayOfCycle: number;
  recentSymptoms: Array<{ symptom: string; frequency: number }>;
  moodPatterns: Array<{ mood: string; frequency: number }>;
  energyLevels: Array<{ level: number; frequency: number }>;
  flowPatterns: Array<{ intensity: string; frequency: number }>;
  totalEntries: number;
  dateRange: {
    start: string;
    end: string;
  };
}

export function prepareCycleDataForAI(
  entries: LogEntry[],
  currentCycle: CycleData | null
): CycleDataSummary {
  // Sort entries by date (most recent first)
  const sortedEntries = [...entries].sort((a, b) => b.date.getTime() - a.date.getTime());
  
  // Get recent entries (last 90 days)
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  const recentEntries = sortedEntries.filter(entry => entry.date >= ninetyDaysAgo);

  // Analyze symptoms
  const symptomCounts: Record<string, number> = {};
  recentEntries.forEach(entry => {
    entry.symptoms.forEach(symptom => {
      symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
    });
  });

  const recentSymptoms = Object.entries(symptomCounts)
    .map(([symptom, frequency]) => ({ symptom, frequency }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 10);

  // Analyze moods
  const moodCounts: Record<string, number> = {};
  recentEntries.forEach(entry => {
    if (entry.mood) {
      moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
    }
  });

  const moodPatterns = Object.entries(moodCounts)
    .map(([mood, frequency]) => ({ mood, frequency }))
    .sort((a, b) => b.frequency - a.frequency);

  // Analyze energy levels
  const energyCounts: Record<number, number> = {};
  recentEntries.forEach(entry => {
    if (entry.energyLevel) {
      energyCounts[entry.energyLevel] = (energyCounts[entry.energyLevel] || 0) + 1;
    }
  });

  const energyLevels = Object.entries(energyCounts)
    .map(([level, frequency]) => ({ level: parseInt(level), frequency }))
    .sort((a, b) => b.frequency - a.frequency);

  // Analyze flow patterns
  const flowCounts: Record<string, number> = {};
  recentEntries.forEach(entry => {
    if (entry.flow) {
      flowCounts[entry.flow] = (flowCounts[entry.flow] || 0) + 1;
    }
  });

  const flowPatterns = Object.entries(flowCounts)
    .map(([intensity, frequency]) => ({ intensity, frequency }))
    .sort((a, b) => b.frequency - a.frequency);

  return {
    cycleLength: currentCycle?.cycleLength || 28,
    periodLength: currentCycle?.periodLength || 5,
    currentPhase: currentCycle?.phase || 'follicular',
    dayOfCycle: currentCycle?.dayOfCycle || 1,
    recentSymptoms,
    moodPatterns,
    energyLevels,
    flowPatterns,
    totalEntries: recentEntries.length,
    dateRange: {
      start: recentEntries.length > 0 ? recentEntries[recentEntries.length - 1].date.toISOString() : '',
      end: recentEntries.length > 0 ? recentEntries[0].date.toISOString() : ''
    }
  };
}

export function createMedicalPrompt(data: CycleDataSummary): string {
  return `You are a medical AI assistant analyzing menstrual cycle data for healthcare providers. Please provide a comprehensive medical analysis based on the following data:

**Cycle Information:**
- Average cycle length: ${data.cycleLength} days
- Average period length: ${data.periodLength} days
- Current phase: ${data.currentPhase}
- Current day of cycle: ${data.dayOfCycle}

**Recent Symptoms (last 90 days):**
${data.recentSymptoms.map(s => `- ${s.symptom.replace('_', ' ')}: ${s.frequency} occurrences`).join('\n')}

**Mood Patterns:**
${data.moodPatterns.map(m => `- ${m.mood}: ${m.frequency} times`).join('\n')}

**Energy Levels (1-5 scale):**
${data.energyLevels.map(e => `- Level ${e.level}: ${e.frequency} times`).join('\n')}

**Flow Patterns:**
${data.flowPatterns.map(f => `- ${f.intensity}: ${f.frequency} times`).join('\n')}

**Data Range:** ${data.totalEntries} entries from ${new Date(data.dateRange.start).toLocaleDateString()} to ${new Date(data.dateRange.end).toLocaleDateString()}

Please provide:
1. **Pattern Analysis**: Key patterns and trends in the data
2. **Health Assessment**: Overall cycle health and any concerns
3. **Recommendations**: Specific medical recommendations or areas to discuss
4. **Risk Factors**: Any potential health risks or irregularities to monitor

Format your response as structured medical insights that would be valuable for a healthcare provider.`;
}

export function createPartnerPrompt(data: CycleDataSummary): string {
  return `You are a relationship AI assistant helping partners understand and support someone through their menstrual cycle. Based on the following cycle data, provide personalized support recommendations:

**Current Cycle Status:**
- Current phase: ${data.currentPhase}
- Day ${data.dayOfCycle} of ${data.cycleLength}-day cycle

**Recent Patterns:**
- Most common symptoms: ${data.recentSymptoms.slice(0, 3).map(s => s.symptom.replace('_', ' ')).join(', ')}
- Typical moods: ${data.moodPatterns.slice(0, 3).map(m => m.mood).join(', ')}
- Energy levels: Usually ${data.energyLevels.length > 0 ? data.energyLevels[0].level : 'moderate'}/5

Please provide:
1. **Current Phase Support**: Specific ways to be supportive during the ${data.currentPhase} phase
2. **Personalized Tips**: Based on their common symptoms and mood patterns
3. **Communication Advice**: How to communicate effectively during this phase
4. **Activity Suggestions**: Appropriate activities and things to avoid
5. **Upcoming Changes**: What to expect in the next few days

Keep the tone supportive, understanding, and practical. Focus on actionable advice that shows care and consideration.`;
}
