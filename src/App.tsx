import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { LogEntry } from './pages/LogEntry';
import { Partner } from './pages/Partner';
import { Family } from './pages/Family';
import { Doctor } from './pages/Doctor';

const Navigation: React.FC = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/log', label: 'Log Entry', icon: '📝' },
    { path: '/partner', label: 'Partner', icon: '💕' },
    { path: '/family', label: 'Family', icon: '👨‍👩‍👧‍👦' },
    { path: '/doctor', label: 'Doctor', icon: '🏥' },
    { path: '/settings', label: 'Settings', icon: '⚙️' }
  ];

  return (
    <nav className="bg-bg-secondary border-b border-border-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-xl font-bold text-gradient">
              PrivyCycle
            </Link>
            <div className="hidden md:flex space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
                    location.pathname === item.path
                      ? 'nav-link-active bg-accent-primary/10'
                      : 'nav-link hover:bg-bg-tertiary'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-text-muted">
              🔒 All data encrypted
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-border-primary">
        <div className="grid grid-cols-3 gap-1 p-2">
          {navItems.slice(0, 6).map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors duration-200 ${
                location.pathname === item.path
                  ? 'nav-link-active bg-accent-primary/10'
                  : 'nav-link hover:bg-bg-tertiary'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-xs">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

const ComingSoon: React.FC<{ title: string }> = ({ title }) => (
  <div className="min-h-screen bg-bg-primary flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-3xl font-bold text-text-primary mb-4">{title}</h1>
      <p className="text-text-secondary mb-8">This feature is coming soon!</p>
      <Link to="/" className="btn-primary inline-block">
        Back to Dashboard
      </Link>
    </div>
  </div>
);

function App(): React.ReactElement {
  return (
    <Router>
      <div className="min-h-screen bg-bg-primary">
        <Navigation />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/log" element={<LogEntry />} />
          <Route path="/partner" element={<Partner />} />
          <Route path="/family" element={<Family />} />
          <Route path="/doctor" element={<Doctor />} />
          <Route path="/settings" element={<ComingSoon title="Settings" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
