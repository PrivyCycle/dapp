import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useCycleData, getCyclePhaseInfo, getDaysUntilNextPeriod } from '../hooks/data/useCycleData';
import { useLogEntries } from '../hooks/data/useLogEntries';

export const Dashboard: React.FC = () => {
  const { currentCycle, prediction, isLoading: cycleLoading } = useCycleData();
  const { entries, isLoading: entriesLoading } = useLogEntries();

  if (cycleLoading || entriesLoading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading your cycle data...</p>
        </div>
      </div>
    );
  }

  // Placeholder for missing cycle data
  const showCyclePlaceholder = !currentCycle;
  const showPredictionPlaceholder = !prediction;

  const phaseInfo = currentCycle ? getCyclePhaseInfo(currentCycle.phase) : { name: 'No Data', description: 'No cycle data available. Please log your period to get started.', color: 'text-text-muted' };
  const daysUntilPeriod = prediction ? getDaysUntilNextPeriod(prediction) : '-';
  const recentEntries = entries.slice(0, 3);

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <div className="bg-bg-secondary border-b border-border-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-text-primary">PrivyCycle</h1>
              <p className="text-text-secondary">Your private period tracker</p>
            </div>
            <Button variant="primary" size="sm">
              Log Entry
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Current Cycle Status */}
          <div className="lg:col-span-2">
            <Card hover className="mb-6">
              <CardHeader>
                <CardTitle>Current Cycle</CardTitle>
              </CardHeader>
              <CardContent>
                {showCyclePlaceholder ? (
                  <div className="text-center text-text-secondary py-8">
                    <div className="text-2xl mb-2">No cycle data available</div>
                    <div className="mb-4">Start by logging your period to see your cycle here.</div>
                    <Button variant="primary">Log Period</Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-accent-primary mb-2">
                        Day {currentCycle.dayOfCycle}
                      </div>
                      <p className="text-text-secondary">of {currentCycle.cycleLength}</p>
                    </div>
                    <div className="text-center">
                      <div className={`text-xl font-semibold mb-2 ${phaseInfo.color}`}>
                        {phaseInfo.name}
                      </div>
                      <p className="text-text-secondary text-sm">{phaseInfo.description}</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-text-primary mb-2">
                        {daysUntilPeriod}
                      </div>
                      <p className="text-text-secondary">days until next period</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Entries */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Entries</CardTitle>
                  <Button variant="ghost" size="sm">View All</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentEntries.length === 0 ? (
                    <div className="text-center text-text-secondary py-4">No entries yet. Start logging your symptoms and moods!</div>
                  ) : (
                    recentEntries.map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between p-4 bg-bg-tertiary rounded-lg">
                        <div>
                          <div className="font-medium text-text-primary">
                            {entry.date.toLocaleDateString()}
                          </div>
                          <div className="text-sm text-text-secondary">
                            {entry.flow && `Flow: ${entry.flow}`}
                            {entry.mood && ` • Mood: ${entry.mood}`}
                            {entry.symptoms.length > 0 && ` • ${entry.symptoms.length} symptoms`}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-text-muted">
                            Energy: {entry.energyLevel}/5
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="primary" className="w-full">
                    Period Started
                  </Button>
                  <Button variant="secondary" className="w-full">
                    Log Symptoms
                  </Button>
                  <Button variant="ghost" className="w-full">
                    Add Note
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Insights */}
            <Card>
              <CardHeader>
                <CardTitle>Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
                    <div className="text-sm font-medium text-success mb-1">
                      Regular Cycles
                    </div>
                    <div className="text-xs text-text-secondary">
                      Your cycles have been very consistent over the past 3 months
                    </div>
                  </div>
                  <div className="p-3 bg-accent-primary/10 border border-accent-primary/20 rounded-lg">
                    <div className="text-sm font-medium text-accent-primary mb-1">
                      Energy Pattern
                    </div>
                    <div className="text-xs text-text-secondary">
                      You typically feel most energetic around day 14-16
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Next Period Prediction */}
            <Card>
              <CardHeader>
                <CardTitle>Prediction</CardTitle>
              </CardHeader>
              <CardContent>
                {showPredictionPlaceholder ? (
                  <div className="text-center text-text-secondary py-8">
                    <div className="text-lg mb-2">No prediction available</div>
                    <div className="mb-4">Log more cycle data to see period predictions here.</div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="text-lg font-semibold text-text-primary mb-2">
                      Next Period
                    </div>
                    <div className="text-2xl font-bold text-accent-primary mb-1">
                      {prediction.nextPeriodDate.toLocaleDateString()}
                    </div>
                    <div className="text-sm text-text-secondary mb-4">
                      {Math.round(prediction.confidence * 100)}% confidence
                    </div>
                    <div className="text-xs text-text-muted">
                      Based on your cycle history
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
