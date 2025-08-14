import React from 'react';
import { useNavigate } from 'react-router-dom';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/app');
  };

  return (
    <div className="min-h-screen bg-subtle-pattern flex flex-col">
      {/* Header */}
      <header className="glass-header border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img 
                src="/logo.png" 
                alt="Comerzia Logo" 
                className="w-8 h-8 rounded-lg object-contain logo-image"
              />
              <h1 className="text-xl font-bold text-gray-900 bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                Comerzia
              </h1>
            </div>
            <button
              onClick={handleGetStarted}
              className="text-primary-600 hover:text-primary-700 font-medium text-sm transition-colors"
            >
              Acceder al Sistema
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          
          {/* Badge */}
          <div className="glass-badge inline-flex items-center px-4 py-2 rounded-full mb-8">
            <span className="text-primary-700 text-sm font-medium">
              Gestión de Encargos Profesional
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-gray-900 mb-6 leading-tight tracking-tight">
            Organiza tus{' '}
            <span className="bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent">
              encargos
            </span>
            <br />
            con simplicidad
          </h1>

          {/* Subtitle */}
          <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Una plataforma moderna y elegante para gestionar pedidos, seguimiento de inventario 
            y comunicación con clientes. Todo en un solo lugar.
          </p>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 max-w-3xl mx-auto">
            <div className="glass-card text-center">
              <div className="glass-icon w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Seguimiento Completo</h3>
              <p className="text-gray-600 text-sm">Controla cada encargo desde el pedido hasta la entrega</p>
            </div>

            <div className="glass-card text-center">
              <div className="glass-icon w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Gestión de Clientes</h3>
              <p className="text-gray-600 text-sm">Mantén organizada toda la información de contacto</p>
            </div>

            <div className="glass-card text-center">
              <div className="glass-icon w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Reportes Inteligentes</h3>
              <p className="text-gray-600 text-sm">Exporta datos y analiza el rendimiento fácilmente</p>
            </div>
          </div>

          {/* CTA Button */}
          <div>
            <button
              onClick={handleGetStarted}
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-200"
            >
              <span className="mr-2">Comenzar Ahora</span>
              <svg 
                className="w-5 h-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="glass-footer border-t border-white/20 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between text-sm text-gray-500 space-y-2 md:space-y-0">
            <div>
              © 2024 Comerzia. Sistema de gestión de encargos profesional.
            </div>
            <div className="flex items-center space-x-2">
              <span>Hecho por</span>
              <a 
                href="https://zonda.one" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
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