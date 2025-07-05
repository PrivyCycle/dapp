import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useCycleData, getCyclePhaseInfo, getDaysUntilNextPeriod } from '../hooks/data/useCycleData';
import { useLogEntries } from '../hooks/data/useLogEntries';

export const Family: React.FC = () => {
  const { currentCycle, prediction, isLoading: cycleLoading } = useCycleData();
  const { entries, isLoading: entriesLoading } = useLogEntries();

  if (cycleLoading || entriesLoading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading family dashboard...</p>
        </div>
      </div>
    );
  }

  const phaseInfo = getCyclePhaseInfo(currentCycle.phase);
  const daysUntilPeriod = getDaysUntilNextPeriod(prediction);
  const recentEntries = entries.slice(0, 5);

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <div className="bg-bg-secondary border-b border-border-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Family Dashboard</h1>
              <p className="text-text-secondary">Sarah's cycle information for family members</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-text-muted">
                👥 Read-only access
              </div>
              <Button variant="ghost" size="sm">
                Manage Access
              </Button>
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
                <CardTitle>Current Status</CardTitle>
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
                  <p className="text-text-secondary text-center">{phaseInfo.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentEntries.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-4 bg-bg-tertiary rounded-lg">
                      <div>
                        <div className="font-medium text-text-primary">
                          {entry.date.toLocaleDateString()}
                        </div>
                        <div className="text-sm text-text-secondary">
                          {entry.mood && `Mood: ${entry.mood}`}
                          {entry.energyLevel && ` • Energy: ${entry.energyLevel}/5`}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-text-muted">
                          {entry.symptoms.length > 0 ? `${entry.symptoms.length} symptoms` : 'No symptoms'}
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
            
            {/* General Wellness */}
            <Card>
              <CardHeader>
                <CardTitle>General Wellness</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">Overall Mood</span>
                    <span className="text-text-primary">Good</span>
                  </div>
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
                    <span className="text-text-secondary">Sleep Quality</span>
                    <span className="text-success">Good</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Family Support Tips */}
            <Card>
              <CardHeader>
                <CardTitle>Family Support Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-accent-primary/10 border border-accent-primary/20 rounded-lg">
                    <div className="text-sm font-medium text-accent-primary mb-1">
                      💪 High Energy Phase
                    </div>
                    <div className="text-xs text-text-secondary">
                      Great time for family activities and outings
                    </div>
                  </div>
                  <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
                    <div className="text-sm font-medium text-success mb-1">
                      🌟 Feeling Confident
                    </div>
                    <div className="text-xs text-text-secondary">
                      Perfect time for important family discussions
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming */}
            <Card>
              <CardHeader>
                <CardTitle>What to Expect</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm font-medium text-text-primary mb-1">
                      Next Week
                    </div>
                    <div className="text-xs text-text-secondary">
                      Energy levels may start to change as cycle progresses
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-text-primary mb-1">
                      In {daysUntilPeriod} days
                    </div>
                    <div className="text-xs text-text-secondary">
                      Next period expected - extra understanding appreciated
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Privacy & Access */}
            <Card>
              <CardHeader>
                <CardTitle>Privacy & Access</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-xs text-text-muted">
                    <p className="mb-2">
                      <strong>Family Access Level:</strong> General wellness information only
                    </p>
                    <p className="mb-2">
                      This dashboard shows only basic cycle information that Sarah has chosen to share with family members.
                    </p>
                    <p>
                      All detailed health data remains private and encrypted.
                    </p>
                  </div>
                  <div className="pt-3 border-t border-border-primary">
                    <div className="text-xs text-text-secondary">
                      <strong>Access granted to:</strong>
                    </div>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-success rounded-full"></div>
                        <span className="text-xs text-text-secondary">Mom (Linda)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-success rounded-full"></div>
                        <span className="text-xs text-text-secondary">Sister (Emma)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
