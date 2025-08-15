import React from 'react';
import { useNavigate } from 'react-router-dom';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/app');
  };

  return (
    <div className="min-h-screen bg-japanese-pattern flex flex-col relative overflow-hidden">
      {/* Japanese Zen Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Sakura petals */}
        <div className="absolute top-1/4 left-1/5 w-3 h-3 bg-orange-200 rounded-full opacity-40 animate-pulse" style={{animationDuration: '4s'}}></div>
        <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-orange-300 rounded-full opacity-30 animate-pulse" style={{animationDuration: '6s', animationDelay: '1s'}}></div>
        <div className="absolute bottom-1/3 left-1/3 w-2.5 h-2.5 bg-orange-100 rounded-full opacity-50 animate-pulse" style={{animationDuration: '5s', animationDelay: '2s'}}></div>
        <div className="absolute top-2/3 right-1/3 w-1.5 h-1.5 bg-orange-200 rounded-full opacity-35 animate-pulse" style={{animationDuration: '7s', animationDelay: '0.5s'}}></div>
        
        {/* Bamboo-inspired lines */}
        <div className="absolute top-1/6 left-1/12 w-0.5 h-24 bg-orange-200 opacity-20 rounded-full"></div>
        <div className="absolute bottom-1/4 right-1/6 w-0.5 h-32 bg-orange-100 opacity-25 rounded-full"></div>
      </div>
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-xl border-b border-orange-100 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img 
                src="/logo.png" 
                alt="Comerzia Logo" 
                className="w-8 h-8 rounded-lg object-contain"
              />
              <h1 className="text-xl font-medium text-gray-800">
                Comerzia
              </h1>
            </div>
            <button
              onClick={handleGetStarted}
              className="text-orange-600 hover:text-orange-700 font-medium text-sm transition-colors px-4 py-2"
            >
              Acceder
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center relative">
          

          {/* Main Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-gray-800 mb-6 leading-tight tracking-wide">
            Organiza tus{' '}
            <span className="text-orange-500 font-normal">
              encargos
            </span>
            <br />
            <span className="text-3xl md:text-4xl lg:text-5xl text-gray-600">
              con simplicidad
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Una plataforma elegante para gestionar pedidos y clientes.
          </p>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 max-w-3xl mx-auto">
            <div className="text-center group">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-200 transition-colors">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">Seguimiento</h3>
              <p className="text-gray-600 text-sm">Control completo de cada encargo</p>
            </div>

            <div className="text-center group">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-200 transition-colors">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">Clientes</h3>
              <p className="text-gray-600 text-sm">Gestión organizada de contactos</p>
            </div>

            <div className="text-center group">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-200 transition-colors">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">Reportes</h3>
              <p className="text-gray-600 text-sm">Análisis y exportación de datos</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={handleGetStarted}
              className="group inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-200"
            >
              <span className="mr-2">Comenzar</span>
              <svg 
                className="w-4 h-4 transition-transform group-hover:translate-x-1" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-xl border-t border-gray-100 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between text-sm text-gray-500 space-y-2 md:space-y-0">
            <div>
              © 2025 Comerzia. Simplicidad en la gestión.
            </div>
            <div className="flex items-center space-x-2">
              <span>Hecho por</span>
              <a 
                href="https://zonda.one" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-orange-600 hover:text-orange-700 font-medium transition-colors"
              >
                ZONDA
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};