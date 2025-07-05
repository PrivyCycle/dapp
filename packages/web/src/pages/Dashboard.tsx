import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useCycleData, getCyclePhaseInfo, getDaysUntilNextPeriod } from '../hooks/data/useCycleData';
import { useEncryptedLogEntries } from '../hooks/data/useEncryptedLogEntries';
import { usePrivy } from '@privy-io/react-auth';
import { encryptedIndexedDbService } from '../lib/storage/encryptedIndexedDBService';
import { LogEntryModal } from '../components/logging/LogEntryModal';
import { LogEntryWizard } from '../components/logging/LogEntryWizard';
import { AllEntriesModal } from '../components/logging/AllEntriesModal';
import { type LogEntry } from '../lib/types/cycle';

export const Dashboard: React.FC = () => {
  const { currentCycle, prediction, isLoading: cycleLoading } = useCycleData();
  const { 
    entries, 
    isLoading: entriesLoading, 
    error: entriesError,
    isInitialized,
    initializeData,
    refreshData,
    clearStorageAndRetry
  } = useEncryptedLogEntries();
  const { user, authenticated, ready, signMessage } = usePrivy();

  // Modal state
  const [selectedEntry, setSelectedEntry] = useState<LogEntry | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isAllEntriesOpen, setIsAllEntriesOpen] = useState(false);

  // Handle log entry click
  const handleLogEntryClick = (entry: LogEntry) => {
    setSelectedEntry(entry);
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEntry(null);
  };

  // Refresh entries data when new entry is added
  const handleEntryAdded = async () => {
    console.log('🔄 New entry added, refreshing dashboard...');
    try {
      await refreshData();
      console.log('✅ Dashboard refreshed successfully');
    } catch (error) {
      console.error('❌ Failed to refresh dashboard:', error);
    }
  };

  // Debug function to check what's in IndexedDB
  const debugStorage = async () => {
    if (!authenticated || !user?.id || !signMessage) {
      alert('Not authenticated');
      return;
    }

    try {
      console.log('🔍 Debug: Checking IndexedDB storage...');
      
      const adaptedSignMessage = async (message: { message: string }): Promise<{ signature: string }> => {
        return await signMessage(message);
      };

      const dbEntries = await encryptedIndexedDbService.getLogEntries(user.id, adaptedSignMessage);
      
      console.log('📊 Debug Results:');
      console.log('State entries count:', entries.length);
      console.log('Database entries count:', dbEntries.length);
      console.log('State entries:', entries);
      console.log('Database entries:', dbEntries);
      
      alert(`State: ${entries.length} entries\nDatabase: ${dbEntries.length} entries\nCheck console for details`);
    } catch (error) {
      console.error('Debug error:', error);
      alert(`Debug failed: ${error}`);
    }
  };

  // Show loading while Privy is initializing
  if (!ready) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary">Initializing wallet connection...</p>
        </div>
      </div>
    );
  }

  // Show initialization screen when authenticated but data not initialized and not currently loading
  if (authenticated && ready && !isInitialized && !entriesLoading) {
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
              <div className="text-sm text-text-secondary">
                Welcome, {user?.email?.address}
              </div>
            </div>
          </div>
        </div>

        {/* Initialization Content */}
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="text-center">
            <CardContent className="py-12">
              <div className="mb-8">
                <div className="w-16 h-16 bg-accent-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-text-primary mb-2">Initialize Your Private Data</h2>
                <p className="text-text-secondary max-w-md mx-auto">
                  Your cycle tracking data will be encrypted with your wallet before being stored locally. 
                  Only you can access this information.
                </p>
              </div>

              {entriesError && (
                <div className="bg-error/10 border border-error/20 rounded-lg p-4 mb-6">
                  <p className="text-error text-sm">{entriesError}</p>
                </div>
              )}

              <div className="space-y-4">
                <Button 
                  variant="primary" 
                  size="lg"
                  onClick={initializeData}
                  disabled={entriesLoading}
                  className="w-full max-w-xs"
                >
                  {entriesLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Initializing...
                    </>
                  ) : (
                    'Initialize Encrypted Data'
                  )}
                </Button>
                
                <div className="text-xs text-text-muted max-w-sm mx-auto">
                  <p className="mb-2">🔒 <strong>Bank-level encryption</strong></p>
                  <p className="mb-2">🔑 <strong>Only your wallet can decrypt</strong></p>
                  <p>💾 <strong>Data stored locally on your device</strong></p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show loading while data is being loaded
  if (cycleLoading || entriesLoading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading your encrypted cycle data...</p>
        </div>
      </div>
    );
  }

  // Placeholder for missing cycle data
  const showCyclePlaceholder = !currentCycle;
  const showPredictionPlaceholder = !prediction;

  const phaseInfo = currentCycle ? getCyclePhaseInfo(currentCycle.phase) : { 
    name: 'No Data', 
    description: 'No cycle data available. Please log your period to get started.', 
    color: 'text-text-muted' 
  };
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
            <div className="flex items-center space-x-4">
              <div className="text-sm text-text-secondary">
                {entries.length} entries • 🔒 Encrypted
              </div>
              <Button variant="ghost" size="sm" onClick={debugStorage}>
                Debug Storage
              </Button>
              <Button variant="ghost" size="sm" onClick={clearStorageAndRetry}>
                Clear Data
              </Button>
              <Button 
                variant="primary" 
                size="sm"
                onClick={() => setIsWizardOpen(true)}
              >
                Log Entry
              </Button>
            </div>
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
                    <Button 
                      variant="primary"
                      onClick={() => setIsWizardOpen(true)}
                    >
                      Log Period
                    </Button>
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
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setIsAllEntriesOpen(true)}
                  >
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentEntries.length === 0 ? (
                    <div className="text-center text-text-secondary py-4">
                      No entries yet. Start logging your symptoms and moods!
                    </div>
                  ) : (
                    recentEntries.map((entry) => (
                      <div 
                        key={entry.id} 
                        className="flex items-center justify-between p-4 bg-bg-tertiary rounded-lg cursor-pointer hover:bg-bg-secondary transition-colors"
                        onClick={() => handleLogEntryClick(entry)}
                      >
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
                  <Button 
                    variant="primary" 
                    className="w-full"
                    onClick={() => setIsWizardOpen(true)}
                  >
                    Period Started
                  </Button>
                  <Button 
                    variant="secondary" 
                    className="w-full"
                    onClick={() => setIsWizardOpen(true)}
                  >
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

      {/* Log Entry Modal */}
      <LogEntryModal
        isOpen={isModalOpen}
        onClose={closeModal}
        entry={selectedEntry}
      />

      {/* Log Entry Wizard */}
      <LogEntryWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onEntryAdded={handleEntryAdded}
      />

      {/* All Entries Modal */}
      <AllEntriesModal
        isOpen={isAllEntriesOpen}
        onClose={() => setIsAllEntriesOpen(false)}
        entries={entries}
        onEntryClick={handleLogEntryClick}
      />
    </div>
  );
};
