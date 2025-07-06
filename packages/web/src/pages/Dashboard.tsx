import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Calendar } from '../components/ui/Calendar';
import { useCycleData, getCyclePhaseInfo, getDaysUntilNextPeriod } from '../hooks/data/useCycleData';
import { useEncryptedLogEntries } from '../hooks/data/useEncryptedLogEntries';
import { usePrivy } from '@privy-io/react-auth';
import { LogEntryModal } from '../components/logging/LogEntryModal';
import { LogEntryWizard } from '../components/logging/LogEntryWizard';
import { AllEntriesModal } from '../components/logging/AllEntriesModal';
import { ShareDataModal } from '../components/sharing/ShareDataModal';
import { SharedDataViewer } from '../components/sharing/SharedDataViewer';
import { type LogEntry } from '../lib/types/cycle';

export const Dashboard: React.FC = () => {
  const { currentCycle, prediction, isLoading: cycleLoading } = useCycleData();
  const { 
    entries, 
    isLoading: entriesLoading, 
    error: entriesError,
    isInitialized,
    initializeData,
    refreshData
  } = useEncryptedLogEntries();
  const { authenticated, ready } = usePrivy();

  // Modal state
  const [selectedEntry, setSelectedEntry] = useState<LogEntry | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isAllEntriesOpen, setIsAllEntriesOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isSharedDataViewerOpen, setIsSharedDataViewerOpen] = useState(false);

  // Auto-initialize when authenticated and ready
  React.useEffect(() => {
    if (authenticated && ready && !isInitialized && !entriesLoading) {
      initializeData();
    }
  }, [authenticated, ready, isInitialized, entriesLoading, initializeData]);

  // Handle log entry click
  const handleLogEntryClick = (entry: LogEntry): void => {
    setSelectedEntry(entry);
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = (): void => {
    setIsModalOpen(false);
    setSelectedEntry(null);
  };

  // Refresh entries data when new entry is added
  const handleEntryAdded = async (): Promise<void> => {
    try {
      await refreshData();
    } catch (error) {
      console.error('Failed to refresh dashboard:', error);
    }
  };

  // Show loading while Privy is initializing
  if (!ready) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-text-primary">Connecting to Wallet</h2>
            <p className="text-text-secondary">Initializing secure connection...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show initialization screen when authenticated but data not initialized
  if (authenticated && ready && !isInitialized && entriesLoading) {
    return (
      <div className="min-h-screen bg-bg-primary">
        {/* Clean Header */}
        <div className="bg-bg-secondary border-b border-border-primary">
          <div className="max-w-4xl mx-auto px-6 py-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-text-primary mb-2">Welcome to PrivyCycle</h1>
              <p className="text-text-secondary">Your private, secure period tracking companion</p>
            </div>
          </div>
        </div>

        {/* Onboarding Content */}
        <div className="max-w-2xl mx-auto px-6 py-12">
          <Card className="text-center" padding="lg">
            <CardContent>
              <div className="space-y-8">
                {/* Security Icon */}
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>

                {/* Main Content */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-text-primary">Enable Secure Storage</h2>
                  <p className="text-text-secondary text-lg leading-relaxed max-w-lg mx-auto">
                    PrivyCycle uses end-to-end encryption to protect your cycle data. 
                    Your wallet signature creates a unique encryption key that only you control.
                  </p>
                </div>

                {/* Security Features */}
                <div className="bg-bg-tertiary rounded-xl p-6 text-left max-w-md mx-auto">
                  <h3 className="font-semibold text-text-primary mb-4 text-center">Your Privacy Protection</h3>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">1</span>
                      </div>
                      <span className="text-text-secondary">Wallet creates unique encryption key via signature</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">2</span>
                      </div>
                      <span className="text-text-secondary">All data encrypted before blockchain storage</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">3</span>
                      </div>
                      <span className="text-text-secondary">Only your wallet can decrypt and read your data</span>
                    </div>
                  </div>
                </div>

                {/* Error Display */}
                {entriesError && (
                  <div className="bg-error/10 border border-error/20 rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                      <svg className="w-5 h-5 text-error mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <div className="text-left">
                        <p className="text-error font-medium mb-1">Setup Failed</p>
                        <p className="text-error text-sm">{entriesError}</p>
                        <p className="text-text-muted text-sm mt-2">
                          Ensure your wallet is unlocked and try again. Refresh the page if the problem persists.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <div className="space-y-6">
                  <Button 
                    variant="primary" 
                    size="lg"
                    onClick={initializeData}
                    disabled={entriesLoading}
                    className="w-full max-w-xs mx-auto"
                  >
                    {entriesLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Setting up encryption...
                      </>
                    ) : (
                      'Enable Secure Storage'
                    )}
                  </Button>
                  
                  {/* Security Badges */}
                  <div className="flex flex-wrap justify-center gap-4 text-xs text-text-muted">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-success rounded-full"></div>
                      <span>End-to-end encryption</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-success rounded-full"></div>
                      <span>Blockchain storage</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-success rounded-full"></div>
                      <span>Zero-knowledge privacy</span>
                    </div>
                  </div>
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
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-text-primary">Loading Dashboard</h2>
            <p className="text-text-secondary">Decrypting your cycle data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Main dashboard data
  const phaseInfo = currentCycle ? getCyclePhaseInfo(currentCycle.phase) : null;
  const daysUntilPeriod = prediction ? getDaysUntilNextPeriod(prediction) : null;
  const recentEntries = entries.slice(0, 4);
  const hasData = entries.length > 0;

  return (
    <div className="min-h-screen bg-bg-primary">


      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Primary Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Cycle Calendar */}
            {hasData ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Cycle Calendar</span>
                    {currentCycle && (
                      <div className="flex items-center space-x-4 text-sm text-text-muted">
                        <span>Day {currentCycle.dayOfCycle}</span>
                        <span className={phaseInfo?.color || 'text-text-primary'}>
                          {phaseInfo?.name}
                        </span>
                      </div>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Calendar
                    entries={entries}
                    currentCycle={currentCycle}
                    onDateClick={(date) => {
                      // Find entry for this date and open it, or open wizard to create new entry
                      const existingEntry = entries.find(e => 
                        e.date.toDateString() === date.toDateString()
                      );
                      if (existingEntry) {
                        handleLogEntryClick(existingEntry);
                      } else {
                        setIsWizardOpen(true);
                      }
                    }}
                  />
                </CardContent>
              </Card>
            ) : (
              /* Current Cycle Status - Empty State */
              <Card hover className="relative overflow-hidden">
                <CardHeader>
                  <CardTitle>Current Cycle</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-text-primary mb-2">Start Your Journey</h3>
                    <p className="text-text-secondary mb-6 max-w-md mx-auto">
                      Begin tracking your cycle to see personalized insights and predictions here.
                    </p>
                    <Button 
                      variant="primary"
                      onClick={() => setIsWizardOpen(true)}
                      className="mx-auto"
                    >
                      Log Your First Entry
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Current Cycle Summary - When data exists */}
            {hasData && currentCycle && (
              <Card>
                <CardHeader>
                  <CardTitle>Current Cycle Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-bg-tertiary rounded-xl">
                      <div className="text-3xl font-bold text-primary mb-1">
                        Day {currentCycle.dayOfCycle}
                      </div>
                      <p className="text-text-secondary text-sm">of {currentCycle.cycleLength} days</p>
                    </div>
                    <div className="text-center p-4 bg-bg-tertiary rounded-xl">
                      <div className={`text-xl font-semibold mb-1 ${phaseInfo?.color || 'text-text-primary'}`}>
                        {phaseInfo?.name || 'Unknown'}
                      </div>
                      <p className="text-text-secondary text-sm">{phaseInfo?.description || 'No phase data'}</p>
                    </div>
                    <div className="text-center p-4 bg-bg-tertiary rounded-xl">
                      <div className="text-3xl font-bold text-text-primary mb-1">
                        {daysUntilPeriod ?? '-'}
                      </div>
                      <p className="text-text-secondary text-sm">days until next period</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Activity</CardTitle>
                  {hasData && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setIsAllEntriesOpen(true)}
                      className="text-primary hover:text-primary-hover"
                    >
                      View All
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {!hasData ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-text-primary mb-2">No entries yet</h3>
                    <p className="text-text-secondary text-sm mb-4">
                      Start logging your symptoms, mood, and flow to see your activity here.
                    </p>
                    <Button 
                      variant="secondary"
                      size="sm"
                      onClick={() => setIsWizardOpen(true)}
                    >
                      Add First Entry
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentEntries.map((entry) => (
                      <div 
                        key={entry.id} 
                        className="flex items-center justify-between p-4 bg-bg-tertiary rounded-xl cursor-pointer hover:bg-bg-accent transition-colors group"
                        onClick={() => handleLogEntryClick(entry)}
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-1">
                            <div className="font-medium text-text-primary">
                              {entry.date.toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                weekday: 'short'
                              })}
                            </div>
                            {entry.flow && (
                              <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                                {entry.flow}
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-text-secondary">
                            {entry.mood && `${entry.mood}`}
                            {entry.symptoms.length > 0 && ` • ${entry.symptoms.length} symptoms`}
                            {entry.energyLevel && ` • Energy: ${entry.energyLevel}/5`}
                          </div>
                        </div>
                        <svg className="w-5 h-5 text-text-muted group-hover:text-text-secondary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Secondary Content */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button 
                    variant="primary" 
                    className="w-full justify-start"
                    onClick={() => setIsWizardOpen(true)}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Period Started
                  </Button>
                  <Button 
                    variant="secondary" 
                    className="w-full justify-start"
                    onClick={() => setIsWizardOpen(true)}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Log Symptoms
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    onClick={() => setIsWizardOpen(true)}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Add Note
                  </Button>
                  {hasData && (
                    <>
                      <div className="border-t border-border-primary my-3"></div>
                      <Button 
                        variant="secondary" 
                        className="w-full justify-start"
                        onClick={() => setIsShareModalOpen(true)}
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                        </svg>
                        Share Data
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start"
                        onClick={() => setIsSharedDataViewerOpen(true)}
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View Shared Data
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Prediction */}
            <Card>
              <CardHeader>
                <CardTitle>Next Period</CardTitle>
              </CardHeader>
              <CardContent>
                {!prediction ? (
                  <div className="text-center py-6">
                    <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <h3 className="font-medium text-text-primary mb-1">Building Prediction</h3>
                    <p className="text-text-secondary text-sm">
                      Log more cycles to see accurate predictions
                    </p>
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <div>
                      <div className="text-2xl font-bold text-primary mb-1">
                        {prediction.nextPeriodDate.toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                      <div className="text-sm text-text-secondary">
                        {Math.round(prediction.confidence * 100)}% confidence
                      </div>
                    </div>
                    <div className="w-full bg-bg-tertiary rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${prediction.confidence * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-text-muted">
                      Based on your cycle history
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Insights */}
            {hasData && (
              <Card>
                <CardHeader>
                  <CardTitle>Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-success/10 border border-success/20 rounded-xl">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-success rounded-full mt-2"></div>
                        <div>
                          <div className="text-sm font-medium text-success mb-1">
                            Consistent Tracking
                          </div>
                          <div className="text-xs text-text-secondary">
                            You've been consistently logging entries
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {entries.length >= 3 && (
                      <div className="p-4 bg-accent/10 border border-accent/20 rounded-xl">
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
                          <div>
                            <div className="text-sm font-medium text-accent mb-1">
                              Pattern Recognition
                            </div>
                            <div className="text-xs text-text-secondary">
                              Starting to identify your unique patterns
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <LogEntryModal
        isOpen={isModalOpen}
        onClose={closeModal}
        entry={selectedEntry}
      />

      <LogEntryWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onEntryAdded={handleEntryAdded}
      />

      <AllEntriesModal
        isOpen={isAllEntriesOpen}
        onClose={() => setIsAllEntriesOpen(false)}
        entries={entries}
        onEntryClick={handleLogEntryClick}
      />

      <ShareDataModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        entries={entries}
        onShareComplete={(result) => {
          console.log('Share completed:', result);
          setIsShareModalOpen(false);
        }}
      />

      {isSharedDataViewerOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-full max-w-4xl mx-4 h-[80vh] bg-white rounded-lg overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-semibold">Shared Data</h2>
              <button
                onClick={() => setIsSharedDataViewerOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="h-full overflow-y-auto">
              <SharedDataViewer />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
