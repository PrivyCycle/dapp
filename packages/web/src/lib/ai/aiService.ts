export interface AIInsightResponse {
  insights: string;
  confidence: number;
  timestamp: string;
}

export class AIService {
  static async getMedicalInsights(_prompt: string): Promise<AIInsightResponse | null> {
    try {
      // For development, return mock medical insights
      // TODO: Use _prompt for actual AI API call in production
      console.log('Medical insights requested for prompt length:', _prompt.length);
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
      
      const mockInsights = `Based on the cycle data analysis:

**Cycle Pattern Assessment:**
• Regular 28-day cycle with consistent patterns
• Normal menstrual flow duration (4-5 days)
• Ovulation occurring around day 14

**Symptom Analysis:**
• Mild to moderate PMS symptoms noted
• Cramping intensity within normal range
• Energy levels fluctuate predictably with cycle phases

**Medical Recommendations:**
• Continue current tracking for pattern monitoring
• Consider iron supplementation if fatigue persists
• Schedule routine gynecological check-up if symptoms worsen

**Risk Factors:**
• No concerning patterns identified
• Cycle regularity suggests healthy hormonal function
• Symptom severity remains manageable

**Next Steps:**
• Maintain consistent logging for 3 more cycles
• Monitor any changes in symptom intensity
• Discuss contraceptive options if family planning relevant

*This analysis is based on self-reported data and should supplement, not replace, professional medical consultation.*`;

      return {
        insights: mockInsights,
        confidence: 0.87,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to fetch medical insights:', error);
      return null;
    }
  }

  static async getPartnerInsights(_prompt: string): Promise<AIInsightResponse | null> {
    try {
      // For development, return mock partner insights
      // TODO: Use _prompt for actual AI API call in production
      console.log('Partner insights requested for prompt length:', _prompt.length);
      await new Promise(resolve => setTimeout(resolve, 1200)); // Simulate API delay
      
      const mockInsights = `**Supporting Your Partner During This Cycle Phase:**

**Current Phase: Follicular (Days 1-13)**
Your partner is in the follicular phase, which typically brings:

**What to Expect:**
• Increasing energy levels as the phase progresses
• Generally positive mood and motivation
• Higher interest in social activities and new experiences
• Improved focus and mental clarity

**How You Can Be Supportive:**
• **Physical Support:** Light exercise together, healthy meal prep, gentle massages if cramping occurs
• **Emotional Support:** Be encouraging about new projects or goals they might want to start
• **Communication:** This is a great time for important conversations and planning
• **Activities:** Perfect time for adventures, trying new restaurants, or planning trips

**Things to Keep in Mind:**
• Energy might still be lower in the first few days if menstruating
• Appetite may be returning to normal after potential PMS changes
• Sleep patterns are typically more regular during this phase

**Thoughtful Gestures:**
• Suggest active dates like hiking or dancing
• Support any new hobbies or interests they express
• Plan something special for the weekend
• Be patient if they're still recovering from PMS symptoms

**Communication Tips:**
• Ask about their energy levels and adjust plans accordingly
• Be enthusiastic about their ideas and goals
• This is an excellent time for relationship discussions

Remember: Every person is different, so pay attention to your partner's individual patterns and preferences!`;

      return {
        insights: mockInsights,
        confidence: 0.82,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to fetch partner insights:', error);
      return null;
    }
  }
}

// Cache for AI responses to avoid redundant calls
class AICache {
  private static cache = new Map<string, { data: AIInsightResponse; timestamp: number }>();
  private static CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  static get(key: string): AIInsightResponse | null {
    const cached = this.cache.get(key);
    if (!cached) {
      return null;
    }

    const now = Date.now();
    if (now - cached.timestamp > this.CACHE_DURATION) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  static set(key: string, data: AIInsightResponse): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  static clear(): void {
    this.cache.clear();
  }
}

export { AICache };
