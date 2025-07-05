import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';

import { Partner } from './pages/Partner';
import { Family } from './pages/Family';
import { Doctor } from './pages/Doctor';
import { AuthGuard } from './components/auth/AuthGuard';
import { useAuth } from './hooks/auth/useAuth';

const Navigation: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  
  const navItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/partner', label: 'Partner', icon: '💕' },
    { path: '/family', label: 'Family', icon: '👨‍👩‍👧‍👦' },
    { path: '/doctor', label: 'Doctor', icon: '🏥' },
    { path: '/settings', label: 'Settings', icon: '⚙️' }
  ];

  const handleLogout = async (): Promise<void> => {
    await logout();
  };

  return (
    <>
      <header className="bg-bg-secondary border-b border-border-primary">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-lg font-bold text-primary">
              PrivyCycle
            </Link>
            
            <div className="flex items-center space-x-3">
              <div className="text-xs text-text-muted hidden sm:block">
                🔒 Encrypted
              </div>
              {user && (
                <button
                  onClick={handleLogout}
                  className="text-xs text-text-muted hover:text-text-accent transition-colors p-2"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Bottom Navigation - Mobile First */}
      <nav className="fixed bottom-0 left-0 right-0 bg-bg-secondary border-t border-border-primary z-50 md:hidden">
        <div className="grid grid-cols-5 h-16">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center space-y-1 transition-colors duration-200 ${
                location.pathname === item.path
                  ? 'text-primary bg-bg-tertiary'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Desktop Sidebar Navigation */}
      <nav className="hidden md:block fixed left-0 top-0 h-full w-64 bg-bg-secondary border-r border-border-primary z-40 pt-16">
        <div className="p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                location.pathname === item.path
                  ? 'text-primary bg-bg-tertiary border border-border-accent'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
        
        {/* Desktop User Info */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="p-3 bg-bg-tertiary rounded-lg">
            <div className="text-xs text-text-muted mb-1">🔒 All data encrypted</div>
            {user && (
              <div className="text-sm text-text-secondary truncate">
                {user.email || 'User'}
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

const ComingSoon: React.FC<{ title: string }> = ({ title }) => (
  <div className="min-h-screen bg-bg-primary flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-3xl font-bold text-text-primary mb-4">{title}</h1>
      <p className="text-text-secondary mb-8">This feature is coming soon!</p>
      <Link to="/" className="bg-primary hover:bg-primary-hover text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 inline-block">
        Back to Dashboard
      </Link>
    </div>
  </div>
);

function App(): React.ReactElement {
  return (
    <Router>
      <AuthGuard>
        <div className="min-h-screen bg-bg-primary">
          <Navigation />
          {/* Main content with proper spacing for navigation */}
          <main className="pb-20 md:pb-0 md:ml-64">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/partner" element={<Partner />} />
              <Route path="/family" element={<Family />} />
              <Route path="/doctor" element={<Doctor />} />
              <Route path="/settings" element={<ComingSoon title="Settings" />} />
            </Routes>
          </main>
        </div>
      </AuthGuard>
    </Router>
  );
}

export default App;
