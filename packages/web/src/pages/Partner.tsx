import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useCycleData, getCyclePhaseInfo, getDaysUntilNextPeriod } from '../hooks/data/useCycleData';
import { usePartnerTips, getTipPriorityColor, getTipCategoryIcon, getPhaseDescription } from '../hooks/sharing/usePartnerTips';
import { useAIPartnerInsights } from '../hooks/ai/useAIPartnerInsights';
import { useEncryptedLogEntries } from '../hooks/data/useEncryptedLogEntries';

export const Partner: React.FC = () => {
  const { currentCycle, prediction, isLoading: cycleLoading } = useCycleData();
  const { entries } = useEncryptedLogEntries();
  const phase = currentCycle ? currentCycle.phase : undefined;
  const { currentPhaseTips, isLoading: tipsLoading } = usePartnerTips(phase || 'menstrual');
  const { insights, confidence, isLoading: aiLoading, error: aiError, refreshInsights } = useAIPartnerInsights();

  if (cycleLoading || tipsLoading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading partner dashboard...</p>
        </div>
      </div>
    );
  }

  if (!currentCycle) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-2 text-text-secondary">No cycle data available</div>
          <div className="mb-4 text-text-secondary">Ask your partner to log their period to see cycle information here.</div>
        </div>
      </div>
    );
  }

  const phaseInfo = getCyclePhaseInfo(currentCycle.phase);
  const daysUntilPeriod = prediction ? getDaysUntilNextPeriod(prediction) : '-';
  const phaseDescription = getPhaseDescription(currentCycle.phase);

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <div className="bg-bg-secondary border-b border-border-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Partner Dashboard</h1>
              <p className="text-text-secondary">Supporting Sarah through her cycle</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-text-muted">Last updated</div>
              <div className="text-text-secondary">Today, 2:30 PM</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Current Status */}
          <div className="lg:col-span-2">
            <Card hover className="mb-6">
              <CardHeader>
                <CardTitle>Current Cycle Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className={`text-2xl font-bold mb-2 ${phaseInfo.color}`}>
                      {phaseInfo.name}
                    </div>
                    <p className="text-text-secondary text-sm">Current Phase</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-text-primary mb-2">
                      {daysUntilPeriod}
                    </div>
                    <p className="text-text-secondary text-sm">days until next period</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent-primary mb-2">
                      Day {currentCycle.dayOfCycle}
                    </div>
                    <p className="text-text-secondary text-sm">of cycle</p>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-bg-tertiary rounded-lg">
                  <p className="text-text-secondary text-center">{phaseDescription}</p>
                </div>
              </CardContent>
            </Card>

            {/* AI Partner Insights */}
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>AI Partner Support Guide</CardTitle>
                  <div className="flex items-center space-x-2">
                    {confidence > 0 && (
                      <span className="text-xs text-text-muted">
                        Confidence: {Math.round(confidence * 100)}%
                      </span>
                    )}
                    <Button
                      onClick={refreshInsights}
                      variant="ghost"
                      size="sm"
                      isLoading={aiLoading}
                    >
                      🔄 Refresh
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {aiLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary mx-auto mb-4"></div>
                      <p className="text-text-secondary">Getting personalized support tips...</p>
                    </div>
                  </div>
                ) : aiError ? (
                  <div className="p-4 bg-error/10 border border-error/20 rounded-lg">
                    <p className="text-error text-sm">{aiError}</p>
                    <Button
                      onClick={refreshInsights}
                      variant="secondary"
                      size="sm"
                      className="mt-2"
                    >
                      Try Again
                    </Button>
                  </div>
                ) : insights ? (
                  <div className="prose prose-sm max-w-none">
                    <div className="whitespace-pre-wrap text-text-primary bg-bg-tertiary p-4 rounded-lg">
                      {insights}
                    </div>
                    <div className="mt-4 p-3 bg-info/10 border border-info/20 rounded-lg">
                      <p className="text-xs text-info">
                        💝 These AI-generated suggestions are based on cycle patterns and are meant to help you be a supportive partner.
                      </p>
                    </div>
                  </div>
                ) : entries.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-text-muted">No cycle data available for analysis.</p>
                    <p className="text-text-muted text-sm mt-2">Ask your partner to start logging their cycle to get AI insights.</p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-text-muted">Click refresh to get personalized support tips based on current cycle data.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Partner Tips */}
            <Card>
              <CardHeader>
                <CardTitle>Tips for This Phase</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currentPhaseTips.map((tip) => (
                    <div key={tip.id} className="p-4 bg-bg-tertiary rounded-lg border-l-4 border-accent-primary">
                      <div className="flex items-start space-x-3">
                        <div className="text-2xl">{getTipCategoryIcon(tip.category)}</div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold text-text-primary">{tip.title}</h3>
                            <span className={`text-xs px-2 py-1 rounded-full bg-bg-secondary ${getTipPriorityColor(tip.priority)}`}>
                              {tip.priority}
                            </span>
                          </div>
                          <p className="text-text-secondary text-sm">{tip.description}</p>
                          <div className="mt-2">
                            <span className="text-xs text-text-muted capitalize bg-bg-secondary px-2 py-1 rounded">
                              {tip.category}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Quick Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">Energy Level</span>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`w-3 h-3 rounded-full ${
                            level <= 4 ? 'bg-accent-primary' : 'bg-bg-tertiary'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">Mood</span>
                    <span className="text-text-primary">Happy & Energetic</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">Comfort Level</span>
                    <span className="text-success">Good</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Support Suggestions */}
            <Card>
              <CardHeader>
                <CardTitle>Support Suggestions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-accent-primary/10 border border-accent-primary/20 rounded-lg">
                    <div className="text-sm font-medium text-accent-primary mb-1">
                      💡 Perfect Time for Adventures
                    </div>
                    <div className="text-xs text-text-secondary">
                      Energy is high - great for trying new activities together
                    </div>
                  </div>
                  <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
                    <div className="text-sm font-medium text-success mb-1">
                      💬 Communication is Clear
                    </div>
                    <div className="text-xs text-text-secondary">
                      Good time for important conversations or planning
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Changes */}
            <Card>
              <CardHeader>
                <CardTitle>What to Expect</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm font-medium text-text-primary mb-1">
                      In 5-7 days
                    </div>
                    <div className="text-xs text-text-secondary">
                      Energy may start to wind down as the luteal phase begins
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-text-primary mb-1">
                      In {daysUntilPeriod} days
                    </div>
                    <div className="text-xs text-text-secondary">
                      Next period expected - extra comfort may be appreciated
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Privacy Notice */}
            <Card>
              <CardHeader>
                <CardTitle>Privacy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-text-muted">
                  <p className="mb-2">
                    This dashboard shows only general cycle information that Sarah has chosen to share with you.
                  </p>
                  <p>
                    All detailed health data remains private and encrypted.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
