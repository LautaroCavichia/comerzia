import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DatabaseProvider } from '../context/DatabaseContext';
import { useAuth } from '../context/AuthContext';
import { EncargosView } from './EncargosView';
import { Dashboard } from './Dashboard';

type ViewType = 'dashboard' | 'encargos';

export const MainApp: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType>('encargos');

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <DatabaseProvider>
      <div className="min-h-screen bg-subtle-pattern">
        <header className="glass-header border-b border-white/20 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-4 flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <button
                  onClick={handleBackToHome}
                  className="flex items-center space-x-3 group"
                >
                  <img 
                    src="/logo.png" 
                    alt="Comerzia Logo" 
                    className="w-8 h-8 rounded-lg object-contain logo-image"
                  />
                  <div>
                    <h1 className="text-xl font-bold text-gray-900 bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                      Comerzia
                    </h1>
                    <p className="text-xs text-primary-600/80 font-medium">Gestión de Encargos</p>
                  </div>
                </button>

                {/* Navigation Tabs */}
                <nav className="hidden md:flex space-x-1">
                  <button
                    onClick={() => setCurrentView('dashboard')}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                      currentView === 'dashboard'
                        ? 'glass-badge text-primary-700'
                        : 'text-gray-600 hover:text-primary-600 hover:bg-white/30'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <span>Dashboard</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setCurrentView('encargos')}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                      currentView === 'encargos'
                        ? 'glass-badge text-primary-700'
                        : 'text-gray-600 hover:text-primary-600 hover:bg-white/30'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                      <span>Encargos</span>
                    </div>
                  </button>
                </nav>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{user?.displayName}</p>
                  <p className="text-xs text-gray-500">{user?.username}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="text-sm font-medium">Cerrar Sesión</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Navigation */}
        <div className="md:hidden glass-footer border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-1 py-2">
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`flex-1 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  currentView === 'dashboard'
                    ? 'glass-badge text-primary-700'
                    : 'text-gray-600 hover:text-primary-600 hover:bg-white/30'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span>Dashboard</span>
                </div>
              </button>
              <button
                onClick={() => setCurrentView('encargos')}
                className={`flex-1 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  currentView === 'encargos'
                    ? 'glass-badge text-primary-700'
                    : 'text-gray-600 hover:text-primary-600 hover:bg-white/30'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  <span>Encargos</span>
                </div>
              </button>
            </nav>
          </div>
        </div>
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {currentView === 'dashboard' ? <Dashboard /> : <EncargosView />}
        </main>
      </div>
    </DatabaseProvider>
  );
};