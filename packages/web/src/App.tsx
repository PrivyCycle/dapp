import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { Circles } from './pages/Circles';
import { Partner } from './pages/Partner';
import { Family } from './pages/Family';
import { Doctor } from './pages/Doctor';
import { AuthGuard } from './components/auth/AuthGuard';
import { useAuth } from './hooks/auth/useAuth';
import { Logo } from './components/ui/Logo';

const Navigation: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  
  const navItems = [
    { path: '/', label: 'Home', icon: 'home' },
    { path: '/circles', label: 'Circles', icon: 'circle' },
    { path: '/partner', label: 'Partner', icon: 'heart' },
    { path: '/doctor', label: 'Doctor', icon: 'medical' }
  ];

  const handleLogout = async (): Promise<void> => {
    await logout();
  };

  return (
    <>
      <header className="bg-bg-secondary border-b border-border-primary safe-area-inset h-16">
        <div className="px-4 py-3 h-full">
          <div className="flex items-center justify-between h-full">
            <Link to="/" className="flex items-center space-x-2 h-full overflow-hidden">
              <div className="h-12 w-auto overflow-hidden flex items-center">
                <Logo variant="full" className="h-20 w-auto transform scale-150 origin-center" />
              </div>
            </Link>
            
            <div className="flex items-center space-x-2">
              <div className="text-xs text-text-muted hidden sm:block">
                Encrypted
              </div>
              <Link 
                to="/settings"
                className="p-2 text-text-muted hover:text-text-accent transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                </svg>
              </Link>
              {user && (
                <button
                  onClick={handleLogout}
                  className="text-xs text-text-muted hover:text-text-accent transition-colors p-2 min-h-[44px]"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Bottom Navigation - Mobile First */}
      <nav className="fixed bottom-0 left-0 right-0 bg-bg-secondary border-t border-border-primary z-50 md:hidden safe-area-inset">
        <div className="grid grid-cols-4 h-16">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center space-y-1 transition-colors duration-200 min-h-[44px] ${
                location.pathname === item.path
                  ? 'text-primary bg-bg-tertiary'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {item.icon === 'home' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />}
                {item.icon === 'circle' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />}
                {item.icon === 'heart' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />}
                {item.icon === 'medical' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />}
              </svg>
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
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {item.icon === 'home' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />}
                {item.icon === 'circle' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />}
                {item.icon === 'heart' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />}
                {item.icon === 'medical' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />}
                {item.icon === 'settings' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />}
              </svg>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
        
        {/* Desktop User Info */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="p-3 bg-bg-tertiary rounded-lg">
            <div className="text-xs text-text-muted mb-1">All data encrypted</div>
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
              <Route path="/circles" element={<Circles />} />
              <Route path="/circles/:memberAddress" element={<Circles />} />
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
