import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DatabaseProvider } from '../context/DatabaseContext';
import { useAuth } from '../context/AuthContext';
import { EncargosView } from './EncargosView';
import { Dashboard } from './Dashboard';
import { ClientsView } from './ClientsView';
import { DataConsistencyChecker } from './DataConsistencyChecker';

type ViewType = 'dashboard' | 'encargos' | 'clients' | 'settings';

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
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-slate-50 to-stone-100 relative">
        {/* Simple Zen Background - Minimal and Subtle */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <svg 
            className="absolute inset-0 w-full h-full opacity-30" 
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1920 1080"
            preserveAspectRatio="xMidYMid slice"
          >
            {/* Simple sand texture */}
            <defs>
              <pattern id="simpleSand" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
                <rect width="200" height="200" fill="#f9f7f4"/>
                <circle cx="50" cy="60" r="0.8" fill="#f0ede8" opacity="0.4"/>
                <circle cx="150" cy="30" r="0.6" fill="#ede9e3" opacity="0.3"/>
                <circle cx="80" cy="160" r="0.7" fill="#f2efea" opacity="0.5"/>
                <circle cx="170" cy="120" r="0.5" fill="#efeae4" opacity="0.3"/>
              </pattern>
            </defs>
            
            <rect width="100%" height="100%" fill="url(#simpleSand)"/>
            
            {/* Subtle zen circles */}
            <circle 
              cx="960" 
              cy="540" 
              r="600" 
              fill="none" 
              stroke="#e8e2d9" 
              strokeWidth="1" 
              opacity="0.15"
            />
            <circle 
              cx="960" 
              cy="540" 
              r="400" 
              fill="none" 
              stroke="#ddd6cc" 
              strokeWidth="0.8" 
              opacity="0.1"
            />
            
            {/* Minimal floating particles */}
            {Array.from({length: 8}).map((_, i) => {
              const x = Math.random() * 1920;
              const y = Math.random() * 1080;
              return (
                <circle 
                  key={`particle-${i}`}
                  cx={x} 
                  cy={y} 
                  r="1" 
                  fill="#e8ddd4" 
                  opacity="0.2"
                />
              );
            })}
          </svg>
        </div>

        <header className="bg-white/95 backdrop-blur-xl border-b border-stone-200 sticky top-0 z-40 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-4 flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <button
                  onClick={handleBackToHome}
                  className="flex items-center space-x-3 group hover:scale-105 transition-transform duration-200"
                >
                  <img 
                    src="/logo.png" 
                    alt="Comerzia Logo" 
                    className="w-8 h-8 rounded-lg object-contain"
                  />
                  <div>
                    <h1 className="text-xl font-light text-stone-800">
                      Comerzia
                    </h1>
                    <p className="text-xs text-orange-600 font-light">Gestión de Encargos</p>
                  </div>
                </button>

                {/* Navigation Tabs */}
                <nav className="hidden md:flex space-x-2">
                  <button
                    onClick={() => setCurrentView('dashboard')}
                    className={`px-4 py-2 rounded-xl text-sm font-light transition-all duration-200 ${
                      currentView === 'dashboard'
                        ? 'bg-orange-100 text-orange-700 shadow-sm'
                        : 'text-stone-600 hover:text-orange-600 hover:bg-orange-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <span>Dashboard</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setCurrentView('encargos')}
                    className={`px-4 py-2 rounded-xl text-sm font-light transition-all duration-200 ${
                      currentView === 'encargos'
                        ? 'bg-orange-100 text-orange-700 shadow-sm'
                        : 'text-stone-600 hover:text-orange-600 hover:bg-orange-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                      <span>Encargos</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setCurrentView('clients')}
                    className={`px-4 py-2 rounded-xl text-sm font-light transition-all duration-200 ${
                      currentView === 'clients'
                        ? 'bg-orange-100 text-orange-700 shadow-sm'
                        : 'text-stone-600 hover:text-orange-600 hover:bg-orange-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>Clientes</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setCurrentView('settings')}
                    className={`px-4 py-2 rounded-xl text-sm font-light transition-all duration-200 ${
                      currentView === 'settings'
                        ? 'bg-orange-100 text-orange-700 shadow-sm'
                        : 'text-stone-600 hover:text-orange-600 hover:bg-orange-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>Configuración</span>
                    </div>
                  </button>
                </nav>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-light text-stone-800">{user?.displayName}</p>
                  <p className="text-xs text-stone-500">{user?.username}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-stone-600 hover:text-red-600 transition-all duration-200 px-3 py-2 rounded-xl hover:bg-red-50"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="text-sm font-light">Cerrar Sesión</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Navigation */}
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-b border-stone-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-1 py-3">
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`flex-1 px-2 py-2 rounded-lg text-xs font-light transition-all duration-200 ${
                  currentView === 'dashboard'
                    ? 'bg-orange-100 text-orange-700'
                    : 'text-stone-600 hover:text-orange-600 hover:bg-orange-50'
                }`}
              >
                <div className="flex flex-col items-center space-y-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span>Dashboard</span>
                </div>
              </button>
              <button
                onClick={() => setCurrentView('encargos')}
                className={`flex-1 px-2 py-2 rounded-lg text-xs font-light transition-all duration-200 ${
                  currentView === 'encargos'
                    ? 'bg-orange-100 text-orange-700'
                    : 'text-stone-600 hover:text-orange-600 hover:bg-orange-50'
                }`}
              >
                <div className="flex flex-col items-center space-y-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  <span>Encargos</span>
                </div>
              </button>
              <button
                onClick={() => setCurrentView('clients')}
                className={`flex-1 px-2 py-2 rounded-lg text-xs font-light transition-all duration-200 ${
                  currentView === 'clients'
                    ? 'bg-orange-100 text-orange-700'
                    : 'text-stone-600 hover:text-orange-600 hover:bg-orange-50'
                }`}
              >
                <div className="flex flex-col items-center space-y-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Clientes</span>
                </div>
              </button>
              <button
                onClick={() => setCurrentView('settings')}
                className={`flex-1 px-2 py-2 rounded-lg text-xs font-light transition-all duration-200 ${
                  currentView === 'settings'
                    ? 'bg-orange-100 text-orange-700'
                    : 'text-stone-600 hover:text-orange-600 hover:bg-orange-50'
                }`}
              >
                <div className="flex flex-col items-center space-y-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Config</span>
                </div>
              </button>
            </nav>
          </div>
        </div>
        
        <main className="relative z-10">
          {currentView === 'dashboard' ? (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <Dashboard />
            </div>
          ) : currentView === 'clients' ? (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <ClientsView />
            </div>
          ) : currentView === 'settings' ? (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="space-y-6">
                <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-stone-200">
                  <h2 className="text-2xl font-light text-stone-800 mb-2">Configuración del Sistema</h2>
                  <p className="text-stone-600 font-light">Herramientas de administración y mantenimiento</p>
                </div>
                <DataConsistencyChecker />
              </div>
            </div>
          ) : (
            <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <EncargosView />
            </div>
          )}
        </main>
      </div>
    </DatabaseProvider>
  );
};