import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { LogEntry } from './pages/LogEntry';
import { Partner } from './pages/Partner';
import { Family } from './pages/Family';
import { Doctor } from './pages/Doctor';
import { AuthGuard } from './components/auth/AuthGuard';
import { useAuth } from './hooks/auth/useAuth';

const Navigation: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  
  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/log', label: 'Log Entry', icon: '📝' },
    { path: '/partner', label: 'Partner', icon: '💕' },
    { path: '/family', label: 'Family', icon: '👨‍👩‍👧‍👦' },
    { path: '/doctor', label: 'Doctor', icon: '🏥' },
    { path: '/settings', label: 'Settings', icon: '⚙️' }
  ];

  const handleLogout = async (): Promise<void> => {
    await logout();
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-xl font-bold text-gray-900">
              PrivyCycle
            </Link>
            <div className="hidden md:flex space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
                    location.pathname === item.path
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              🔒 All data encrypted
            </div>
            {user && (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600">
                  {user.email || 'User'}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-gray-200">
        <div className="grid grid-cols-3 gap-1 p-2">
          {navItems.slice(0, 6).map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors duration-200 ${
                location.pathname === item.path
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
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
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">{title}</h1>
      <p className="text-gray-600 mb-8">This feature is coming soon!</p>
      <Link to="/" className="btn-primary inline-block">
        Back to Dashboard
      </Link>
    </div>
  </div>
);

function App(): React.ReactElement {
  return (
    <Router>
      <AuthGuard>
        <div className="min-h-screen bg-gray-50">
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
      </AuthGuard>
    </Router>
  );
}

export default App;
