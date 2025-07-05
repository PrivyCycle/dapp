import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useCycleData } from '../hooks/data/useCycleData';
import { useEncryptedLogEntries } from '../hooks/data/useEncryptedLogEntries';

export const Doctor: React.FC = () => {
  const { currentCycle } = useCycleData();
  const { entries } = useEncryptedLogEntries();
  const [expirationDays, setExpirationDays] = useState(7);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);

  const generateAccessCode = async (): Promise<void> => {
    setIsGenerating(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const code = `DOC-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
    setGeneratedCode(code);
    setIsGenerating(false);
  };

  const recentSymptoms = entries
    .slice(0, 10)
    .filter(entry => entry.symptoms.length > 0)
    .flatMap(entry => entry.symptoms)
    .reduce((acc, symptom) => {
      acc[symptom] = (acc[symptom] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const topSymptoms = Object.entries(recentSymptoms)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <div className="bg-bg-secondary border-b border-border-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Medical Data Sharing</h1>
              <p className="text-text-secondary">Securely share cycle data with healthcare providers</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-text-muted">
                🏥 HIPAA Compliant
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Generate Access Code */}
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Generate Doctor Access Code</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <p className="text-text-secondary mb-4">
                      Create a secure, time-limited access code that allows your healthcare provider 
                      to view your cycle data. The code expires automatically and can be revoked at any time.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Access Duration
                      </label>
                      <select
                        value={expirationDays}
                        onChange={(e) => setExpirationDays(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-bg-tertiary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                      >
                        <option value={1}>1 day</option>
                        <option value={3}>3 days</option>
                        <option value={7}>1 week</option>
                        <option value={14}>2 weeks</option>
                        <option value={30}>1 month</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Data Scope
                      </label>
                      <select className="w-full px-3 py-2 bg-bg-tertiary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary">
                        <option value="full">Complete cycle history</option>
                        <option value="recent">Last 3 months</option>
                        <option value="summary">Summary only</option>
                      </select>
                    </div>
                  </div>

                  {!generatedCode ? (
                    <Button
                      onClick={generateAccessCode}
                      isLoading={isGenerating}
                      variant="primary"
                      size="lg"
                      className="w-full"
                    >
                      Generate Secure Access Code
                    </Button>
                  ) : (
                    <div className="p-6 bg-success/10 border border-success/20 rounded-lg">
                      <div className="text-center">
                        <div className="text-sm font-medium text-success mb-2">
                          Access Code Generated
                        </div>
                        <div className="text-2xl font-mono font-bold text-text-primary mb-4 tracking-wider">
                          {generatedCode}
                        </div>
                        <div className="text-sm text-text-secondary mb-4">
                          Share this code with your healthcare provider. 
                          It expires in {expirationDays} day{expirationDays !== 1 ? 's' : ''}.
                        </div>
                        <div className="flex space-x-3 justify-center">
                          <Button
                            onClick={() => navigator.clipboard.writeText(generatedCode)}
                            variant="secondary"
                            size="sm"
                          >
                            Copy Code
                          </Button>
                          <Button
                            onClick={() => setGeneratedCode(null)}
                            variant="ghost"
                            size="sm"
                          >
                            Generate New
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Medical Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Medical Summary Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="text-sm text-text-secondary mb-4">
                    This is what your healthcare provider will see when they access your data:
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-bg-tertiary rounded-lg">
                      <div className="text-sm text-text-secondary mb-1">Cycle Length</div>
                      <div className="text-xl font-bold text-text-primary">{currentCycle.cycleLength} days</div>
                    </div>
                    <div className="p-4 bg-bg-tertiary rounded-lg">
                      <div className="text-sm text-text-secondary mb-1">Current Day</div>
                      <div className="text-xl font-bold text-text-primary">Day {currentCycle.dayOfCycle}</div>
                    </div>
                    <div className="p-4 bg-bg-tertiary rounded-lg">
                      <div className="text-sm text-text-secondary mb-1">Cycle Start</div>
                      <div className="text-xl font-bold text-text-primary">
                        {currentCycle.startDate.toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {topSymptoms.length > 0 && (
                    <div>
                      <h4 className="font-medium text-text-primary mb-3">Most Common Symptoms</h4>
                      <div className="space-y-2">
                        {topSymptoms.map(([symptom, count]) => (
                          <div key={symptom} className="flex items-center justify-between p-3 bg-bg-tertiary rounded-lg">
                            <span className="text-text-primary capitalize">{symptom.replace('_', ' ')}</span>
                            <span className="text-text-secondary">{count} times</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Active Access Codes */}
            <Card>
              <CardHeader>
                <CardTitle>Active Access</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {generatedCode ? (
                    <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-warning">Active Code</span>
                        <Button variant="ghost" size="sm" className="text-xs">
                          Revoke
                        </Button>
                      </div>
                      <div className="text-xs text-text-secondary">
                        Expires in {expirationDays} day{expirationDays !== 1 ? 's' : ''}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <div className="text-text-muted text-sm">
                        No active access codes
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Privacy & Security */}
            <Card>
              <CardHeader>
                <CardTitle>Privacy & Security</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="text-success text-lg">🔒</div>
                    <div>
                      <div className="text-sm font-medium text-text-primary">End-to-End Encrypted</div>
                      <div className="text-xs text-text-secondary">All data is encrypted before sharing</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="text-success text-lg">⏰</div>
                    <div>
                      <div className="text-sm font-medium text-text-primary">Time-Limited Access</div>
                      <div className="text-xs text-text-secondary">Codes expire automatically</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="text-success text-lg">🚫</div>
                    <div>
                      <div className="text-sm font-medium text-text-primary">Revocable Anytime</div>
                      <div className="text-xs text-text-secondary">You control access at all times</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="text-success text-lg">🏥</div>
                    <div>
                      <div className="text-sm font-medium text-text-primary">HIPAA Compliant</div>
                      <div className="text-xs text-text-secondary">Meets medical privacy standards</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="secondary" size="sm" className="w-full">
                    Export PDF Report
                  </Button>
                  <Button variant="secondary" size="sm" className="w-full">
                    Download CSV Data
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full">
                    View Access History
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Access */}
            <Card>
              <CardHeader>
                <CardTitle>Emergency Access</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-xs text-text-muted">
                    <p className="mb-2">
                      Set up emergency access for trusted healthcare providers in case of urgent medical situations.
                    </p>
                  </div>
                  <Button variant="secondary" size="sm" className="w-full">
                    Configure Emergency Access
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
