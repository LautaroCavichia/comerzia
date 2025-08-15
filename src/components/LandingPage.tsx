import React from 'react';
import { useNavigate } from 'react-router-dom';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/app');
  };

  return (
    <div className="min-h-screen bg-japanese-pattern flex flex-col relative overflow-hidden">
      {/* Zen Mandala Vignette */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <svg 
          className="absolute inset-0 w-full h-full" 
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1920 1080"
          style={{
            animation: 'mandalaPulse 15s ease-in-out infinite'
          }}
        >
          {/* Outer edge elements - higher opacity */}
          {Array.from({length: 32}).map((_, i) => {
            const angle = (i * 360) / 32;
            const x = 960 + Math.cos((angle * Math.PI) / 180) * 800;
            const y = 540 + Math.sin((angle * Math.PI) / 180) * 450;
            return (
              <g key={`outer-${i}`}>
                <ellipse 
                  cx={x} 
                  cy={y} 
                  rx="8" 
                  ry="20" 
                  fill="#f97316" 
                  opacity="0.15"
                  transform={`rotate(${angle + 90} ${x} ${y})`}
                />
              </g>
            );
          })}

          {/* Middle ring */}
          {Array.from({length: 24}).map((_, i) => {
            const angle = (i * 360) / 24;
            const x = 960 + Math.cos((angle * Math.PI) / 180) * 600;
            const y = 540 + Math.sin((angle * Math.PI) / 180) * 350;
            return (
              <g key={`middle-${i}`}>
                <circle 
                  cx={x} 
                  cy={y} 
                  r="6" 
                  fill="#f97316" 
                  opacity="0.1"
                />
                <ellipse 
                  cx={x} 
                  cy={y} 
                  rx="4" 
                  ry="12" 
                  fill="#fb923c" 
                  opacity="0.08"
                  transform={`rotate(${angle} ${x} ${y})`}
                />
              </g>
            );
          })}

          {/* Inner ring */}
          {Array.from({length: 16}).map((_, i) => {
            const angle = (i * 360) / 16;
            const x = 960 + Math.cos((angle * Math.PI) / 180) * 400;
            const y = 540 + Math.sin((angle * Math.PI) / 180) * 250;
            return (
              <g key={`inner-${i}`}>
                <circle 
                  cx={x} 
                  cy={y} 
                  r="4" 
                  fill="#f97316" 
                  opacity="0.06"
                />
              </g>
            );
          })}

          {/* Very inner - barely visible */}
          {Array.from({length: 8}).map((_, i) => {
            const angle = (i * 360) / 8;
            const x = 960 + Math.cos((angle * Math.PI) / 180) * 200;
            const y = 540 + Math.sin((angle * Math.PI) / 180) * 120;
            return (
              <g key={`center-${i}`}>
                <circle 
                  cx={x} 
                  cy={y} 
                  r="2" 
                  fill="#f97316" 
                  opacity="0.03"
                />
              </g>
            );
          })}

          {/* Corner accent mandalas */}
          <g transform="translate(150,150)">
            {Array.from({length: 8}).map((_, i) => (
              <ellipse 
                key={`corner1-${i}`}
                cx="0" 
                cy="-60" 
                rx="5" 
                ry="15" 
                fill="#f97316" 
                opacity="0.12"
                transform={`rotate(${i * 45})`}
              />
            ))}
          </g>

          <g transform="translate(1770,150)">
            {Array.from({length: 8}).map((_, i) => (
              <ellipse 
                key={`corner2-${i}`}
                cx="0" 
                cy="-60" 
                rx="5" 
                ry="15" 
                fill="#f97316" 
                opacity="0.12"
                transform={`rotate(${i * 45})`}
              />
            ))}
          </g>

          <g transform="translate(150,930)">
            {Array.from({length: 8}).map((_, i) => (
              <ellipse 
                key={`corner3-${i}`}
                cx="0" 
                cy="-60" 
                rx="5" 
                ry="15" 
                fill="#f97316" 
                opacity="0.12"
                transform={`rotate(${i * 45})`}
              />
            ))}
          </g>

          <g transform="translate(1770,930)" className="animate-pulse" style={{animationDuration: '8s'}}>
            {Array.from({length: 8}).map((_, i) => (
              <ellipse 
                key={`corner4-${i}`}
                cx="0" 
                cy="-60" 
                rx="5" 
                ry="15" 
                fill="#f97316" 
                opacity="0.12"
                transform={`rotate(${i * 45})`}
              />
            ))}
          </g>
        </svg>
      </div>

      {/* Floating Elements & Wave Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-[1]">
        {/* Floating particles with gentle movement */}
        <div className="absolute top-1/4 left-1/5 w-3 h-3 bg-orange-200 rounded-full opacity-40" 
             style={{
               animation: 'float 8s ease-in-out infinite, fadeInOut 4s ease-in-out infinite'
             }}></div>
        <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-orange-300 rounded-full opacity-30" 
             style={{
               animation: 'float 10s ease-in-out infinite reverse, fadeInOut 6s ease-in-out infinite',
               animationDelay: '1s'
             }}></div>
        <div className="absolute bottom-1/3 left-1/3 w-2.5 h-2.5 bg-orange-100 rounded-full opacity-50" 
             style={{
               animation: 'float 12s ease-in-out infinite, fadeInOut 5s ease-in-out infinite',
               animationDelay: '2s'
             }}></div>
        <div className="absolute top-2/3 right-1/3 w-1.5 h-1.5 bg-orange-200 rounded-full opacity-35" 
             style={{
               animation: 'float 9s ease-in-out infinite reverse, fadeInOut 7s ease-in-out infinite',
               animationDelay: '0.5s'
             }}></div>
        
        {/* More floating particles */}
        <div className="absolute top-1/6 left-2/3 w-1 h-1 bg-orange-300 rounded-full opacity-25" 
             style={{
               animation: 'float 15s ease-in-out infinite, fadeInOut 8s ease-in-out infinite',
               animationDelay: '3s'
             }}></div>
        <div className="absolute bottom-1/6 right-1/5 w-2 h-2 bg-orange-100 rounded-full opacity-30" 
             style={{
               animation: 'float 11s ease-in-out infinite reverse, fadeInOut 6s ease-in-out infinite',
               animationDelay: '4s'
             }}></div>
        
        {/* Additional bottom particles */}
        <div className="absolute bottom-1/5 left-1/8 w-3 h-3 bg-orange-200 rounded-full opacity-40" 
             style={{
               animation: 'float 8s ease-in-out infinite, fadeInOut 4s ease-in-out infinite',
               animationDelay: '1s'
             }}></div>
        <div className="absolute bottom-1/4 right-1/6 w-2 h-2 bg-orange-300 rounded-full opacity-30" 
             style={{
               animation: 'float 10s ease-in-out infinite reverse, fadeInOut 6s ease-in-out infinite',
               animationDelay: '2s'
             }}></div>
        <div className="absolute bottom-1/8 left-1/2 w-2.5 h-2.5 bg-orange-100 rounded-full opacity-50" 
             style={{
               animation: 'float 12s ease-in-out infinite, fadeInOut 5s ease-in-out infinite',
               animationDelay: '3s'
             }}></div>
        <div className="absolute bottom-1/6 right-2/5 w-1.5 h-1.5 bg-orange-200 rounded-full opacity-35" 
             style={{
               animation: 'float 9s ease-in-out infinite reverse, fadeInOut 7s ease-in-out infinite',
               animationDelay: '0.5s'
             }}></div>
        <div className="absolute bottom-1/12 left-3/5 w-1 h-1 bg-orange-300 rounded-full opacity-25" 
             style={{
               animation: 'float 15s ease-in-out infinite, fadeInOut 8s ease-in-out infinite',
               animationDelay: '4s'
             }}></div>
        <div className="absolute bottom-1/3 right-1/8 w-2 h-2 bg-orange-100 rounded-full opacity-30" 
             style={{
               animation: 'float 11s ease-in-out infinite reverse, fadeInOut 6s ease-in-out infinite',
               animationDelay: '5s'
             }}></div>
      </div>

      {/* Custom CSS animations */}
      <style>{`
        @keyframes mandalaPulse {
          0%, 100% { 
            opacity: 0.8; 
          }
          33% { 
            opacity: 0.4; 
          }
          66% { 
            opacity: 0.6; 
          }
        }
        
        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) translateX(0px); 
          }
          25% { 
            transform: translateY(-10px) translateX(5px); 
          }
          50% { 
            transform: translateY(-20px) translateX(-5px); 
          }
          75% { 
            transform: translateY(-10px) translateX(10px); 
          }
        }
        
        @keyframes fadeInOut {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.6; }
        }
        
        @keyframes wave {
          0%, 100% { 
            transform: scaleY(1) rotateZ(0deg); 
          }
          25% { 
            transform: scaleY(1.1) rotateZ(1deg); 
          }
          50% { 
            transform: scaleY(0.9) rotateZ(-1deg); 
          }
          75% { 
            transform: scaleY(1.05) rotateZ(0.5deg); 
          }
        }
        
      `}</style>
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
      <main className="h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 relative z-10">
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


          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
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

          {/* Animated Scroll Arrow */}
          <div className="flex justify-center">
            <button
              onClick={() => {
                const nextSection = document.querySelector('#how-it-works');
                nextSection?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="group flex flex-col items-center space-y-2 text-gray-400 hover:text-orange-500 transition-all duration-300 animate-bounce"
              style={{
                animationDuration: '2s',
                animationIterationCount: 'infinite'
              }}
            >
              <span className="text-sm font-medium opacity-75 group-hover:opacity-100 transition-opacity">
                Descubre más
              </span>
              <svg 
                className="w-6 h-6 transform group-hover:translate-y-1 transition-transform duration-300" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>
          </div>

        </div>
      </main>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50 backdrop-blur-sm relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-light text-gray-800 mb-4">
              ¿Cómo funciona 
              <span className="text-orange-500 font-normal"> Comerzia</span>?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Una solución completa para gestionar encargos de cualquier tipo de negocio desde el pedido hasta la entrega
            </p>
          </div>

          {/* Process Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-800 mb-3">1. Registra encargos</h3>
              <p className="text-gray-600">
                Añade nuevos encargos con información del producto, proveedor, ubicación y datos del cliente
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-800 mb-3">2. Gestiona el proceso</h3>
              <p className="text-gray-600">
                Marca estados de pedido, recepción y entrega. Controla pagos y notifica automáticamente a clientes por email o SMS
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-800 mb-3">3. Analiza resultados</h3>
              <p className="text-gray-600">
                Visualiza métricas, productos más solicitados y clientes frecuentes con gráficos detallados
              </p>
            </div>
          </div>

          {/* Key Features */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-lg border border-orange-100">
            <h3 className="text-2xl font-medium text-gray-800 mb-6 text-center">Funcionalidades principales</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mt-1 flex-shrink-0">
                  <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">Control de estados</h4>
                  <p className="text-gray-600 text-sm">Pedido → Recibido → Entregado → Pagado → Cliente notificado</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mt-1 flex-shrink-0">
                  <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">Notificaciones automáticas</h4>
                  <p className="text-gray-600 text-sm">Email y SMS cuando el pedido llega o se retrasa</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mt-1 flex-shrink-0">
                  <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">Gestión de clientes</h4>
                  <p className="text-gray-600 text-sm">Nombre, contacto y historial de pedidos organizados</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mt-1 flex-shrink-0">
                  <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">Dashboard analítico</h4>
                  <p className="text-gray-600 text-sm">Métricas, gráficos y análisis de tendencias</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="text-center mt-12">
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl p-8 border border-orange-200">
              <h3 className="text-2xl font-medium text-gray-800 mb-4">¿Necesitas esta solución para tu empresa?</h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Comerzia puede adaptarse a las necesidades específicas de tu negocio. 
                Contáctanos para implementar un sistema personalizado de gestión de encargos.
              </p>
              <a 
                href="https://zonda.one" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-200"
              >
                <span className="mr-2">Contactar ZONDA</span>
                <svg 
                  className="w-4 h-4" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

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