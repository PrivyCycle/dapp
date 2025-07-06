import { useState, useEffect, useCallback } from 'react';
import { AIService, AICache } from '../../lib/ai/aiService';
import { prepareCycleDataForAI, createPartnerPrompt } from '../../lib/ai/dataPreparation';
import { useEncryptedLogEntries } from '../data/useEncryptedLogEntries';
import { useCycleData } from '../data/useCycleData';

export const useAIPartnerInsights = (): {
  insights: string | null;
  confidence: number;
  isLoading: boolean;
  error: string | null;
  refreshInsights: () => Promise<void>;
} => {
  const { entries, isReady: entriesReady } = useEncryptedLogEntries();
  const { currentCycle } = useCycleData();
  
  const [insights, setInsights] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateInsights = useCallback(async (): Promise<void> => {
    if (!entriesReady || entries.length === 0) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Prepare data for AI analysis
      const cycleData = prepareCycleDataForAI(entries, currentCycle);
      const prompt = createPartnerPrompt(cycleData);
      
      // Create cache key based on data
      const cacheKey = `partner-${JSON.stringify(cycleData)}`;
      
      // Check cache first
      const cached = AICache.get(cacheKey);
      if (cached) {
        setInsights(cached.insights);
        setConfidence(cached.confidence);
        setIsLoading(false);
        return;
      }

      // Get AI insights
      const response = await AIService.getPartnerInsights(prompt);
      
      if (response) {
        setInsights(response.insights);
        setConfidence(response.confidence);
        
        // Cache the response
        AICache.set(cacheKey, response);
      } else {
        setError('Failed to generate partner insights');
      }
    } catch (err) {
      console.error('Error generating partner insights:', err);
      setError('An error occurred while generating insights');
    } finally {
      setIsLoading(false);
    }
  }, [entries, currentCycle, entriesReady]);

  const refreshInsights = useCallback(async (): Promise<void> => {
    AICache.clear();
    await generateInsights();
  }, [generateInsights]);

  // Auto-generate insights when data is ready
  useEffect(() => {
    if (entriesReady && entries.length > 0 && !insights && !isLoading) {
      generateInsights();
    }
  }, [entriesReady, entries.length, insights, isLoading, generateInsights]);

  return {
    insights,
    confidence,
    isLoading,
    error,
    refreshInsights,
  };
};
