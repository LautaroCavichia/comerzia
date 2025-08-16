import React from 'react';
import { useNavigate } from 'react-router-dom';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/app');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-slate-50 to-stone-100 flex flex-col relative overflow-hidden">
      {/* Zen Garden Background with Japanese Wave Patterns */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <svg 
          className="absolute inset-0 w-full h-full min-h-screen" 
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1920 1080"
          preserveAspectRatio="xMidYMid slice"
          style={{
            animation: 'zenBreathing 20s ease-in-out infinite'
          }}
        >
          {/* Japanese Wave Pattern - Great Wave inspired */}
          <defs>
            <pattern id="sandTexture" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <rect width="100" height="100" fill="#f7f3f0"/>
              <circle cx="20" cy="30" r="0.5" fill="#e7ddd7" opacity="0.6"/>
              <circle cx="70" cy="15" r="0.3" fill="#d6ccc4" opacity="0.5"/>
              <circle cx="45" cy="80" r="0.4" fill="#e2d8d1" opacity="0.7"/>
              <circle cx="85" cy="60" r="0.2" fill="#d9cfc7" opacity="0.4"/>
              <circle cx="15" cy="75" r="0.3" fill="#e5dbd4" opacity="0.6"/>
            </pattern>
            
            <pattern id="waveTexture" x="0" y="0" width="200" height="100" patternUnits="userSpaceOnUse">
              <rect width="200" height="100" fill="url(#sandTexture)"/>
              <path d="M0,50 Q50,20 100,50 T200,50" stroke="#d4c4b0" strokeWidth="0.5" fill="none" opacity="0.3"/>
              <path d="M0,60 Q50,30 100,60 T200,60" stroke="#c9b8a3" strokeWidth="0.3" fill="none" opacity="0.4"/>
            </pattern>
          </defs>
          
          {/* Sand base */}
          <rect width="100%" height="100%" fill="url(#waveTexture)"/>
          
          {/* Japanese Wave Patterns */}
          <g className="opacity-30">
            {/* Large background wave */}
            <path 
              d="M-200,600 Q200,400 600,500 T1400,450 Q1600,420 1920,480 L1920,1080 L-200,1080 Z" 
              fill="#e6ddd6" 
              opacity="0.6"
              style={{
                animation: 'waveFlow 25s ease-in-out infinite'
              }}
            />
            
            {/* Medium wave */}
            <path 
              d="M-100,700 Q300,550 700,600 T1300,580 Q1500,560 1920,590 L1920,1080 L-100,1080 Z" 
              fill="#ddd4cc" 
              opacity="0.8"
              style={{
                animation: 'waveFlow 30s ease-in-out infinite reverse',
                animationDelay: '-5s'
              }}
            />
            
            {/* Small wave details */}
            <path 
              d="M0,780 Q100,720 200,760 T400,750 Q500,740 600,755 T800,745 Q900,735 1000,750 T1200,740 Q1400,730 1920,745 L1920,1080 L0,1080 Z" 
              fill="#d7cdc3" 
              opacity="0.9"
              style={{
                animation: 'waveFlow 35s ease-in-out infinite',
                animationDelay: '-10s'
              }}
            />
          </g>
          
          {/* Zen Garden Stones */}
          <g className="opacity-70">
            {/* Large stone - bottom left */}
            <ellipse 
              cx="200" 
              cy="850" 
              rx="80" 
              ry="35" 
              fill="#b8ada3" 
              opacity="0.8"
              style={{
                animation: 'stoneGlow 40s ease-in-out infinite'
              }}
            />
            <ellipse 
              cx="195" 
              cy="845" 
              rx="75" 
              ry="32" 
              fill="#c4b9ae" 
              opacity="0.6"
            />
            
            {/* Medium stone - top right */}
            <ellipse 
              cx="1600" 
              cy="300" 
              rx="60" 
              ry="25" 
              fill="#aca196" 
              opacity="0.7"
              style={{
                animation: 'stoneGlow 45s ease-in-out infinite',
                animationDelay: '-15s'
              }}
            />
            <ellipse 
              cx="1595" 
              cy="297" 
              rx="55" 
              ry="22" 
              fill="#b7ac9f" 
              opacity="0.5"
            />
            
            {/* Small stones scattered */}
            <ellipse cx="800" cy="400" rx="30" ry="12" fill="#b0a599" opacity="0.6"/>
            <ellipse cx="400" cy="200" rx="25" ry="10" fill="#a8a092" opacity="0.5"/>
            <ellipse cx="1200" cy="700" rx="35" ry="15" fill="#b5aa9d" opacity="0.7"/>
            <ellipse cx="600" cy="900" rx="20" ry="8" fill="#a3988c" opacity="0.4"/>
          </g>
          
          {/* Sparkle Sand Particles */}
          <g className="opacity-50">
            {Array.from({length: 50}).map((_, i) => {
              const x = Math.random() * 1920;
              const y = Math.random() * 1080;
              const delay = Math.random() * 20;
              return (
                <circle 
                  key={`sparkle-${i}`}
                  cx={x} 
                  cy={y} 
                  r="1" 
                  fill="#f4e8d8" 
                  opacity="0.8"
                  style={{
                    animation: `sparkle 8s ease-in-out infinite`,
                    animationDelay: `${delay}s`
                  }}
                />
              );
            })}
          </g>
          
          {/* Zen Circle Elements */}
          <g className="opacity-20">
            <circle 
              cx="960" 
              cy="540" 
              r="400" 
              fill="none" 
              stroke="#d4c4b0" 
              strokeWidth="1" 
              strokeDasharray="10,20"
              style={{
                animation: 'circleRotate 60s linear infinite'
              }}
            />
            <circle 
              cx="960" 
              cy="540" 
              r="300" 
              fill="none" 
              stroke="#c9b8a3" 
              strokeWidth="0.8" 
              strokeDasharray="5,15"
              style={{
                animation: 'circleRotate 80s linear infinite reverse'
              }}
            />
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
        @keyframes zenBreathing {
          0%, 100% { 
            opacity: 0.9; 
            transform: scale(1);
          }
          50% { 
            opacity: 0.7; 
            transform: scale(1.02);
          }
        }
        
        @keyframes waveFlow {
          0%, 100% { 
            transform: translateX(0px) scaleY(1); 
          }
          33% { 
            transform: translateX(-20px) scaleY(1.05); 
          }
          66% { 
            transform: translateX(10px) scaleY(0.95); 
          }
        }
        
        @keyframes stoneGlow {
          0%, 100% { 
            opacity: 0.8; 
            filter: brightness(1);
          }
          50% { 
            opacity: 0.6; 
            filter: brightness(1.1);
          }
        }
        
        @keyframes sparkle {
          0%, 100% { 
            opacity: 0.2; 
            transform: scale(1);
          }
          25% { 
            opacity: 0.8; 
            transform: scale(1.5);
          }
          50% { 
            opacity: 0.4; 
            transform: scale(0.8);
          }
          75% { 
            opacity: 0.9; 
            transform: scale(1.2);
          }
        }
        
        @keyframes circleRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) translateX(0px); 
          }
          25% { 
            transform: translateY(-15px) translateX(8px); 
          }
          50% { 
            transform: translateY(-25px) translateX(-8px); 
          }
          75% { 
            transform: translateY(-12px) translateX(12px); 
          }
        }
        
        @keyframes fadeInOut {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.8; }
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
      <main className="min-h-screen flex items-center justify-center px-4 sm:px-6 md:px-8 lg:px-12 relative z-10 py-16 sm:py-24 md:py-32">
        <div className="max-w-7xl mx-auto text-center relative">
          

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl font-light text-gray-800 mb-8 sm:mb-10 md:mb-12 leading-[0.9] tracking-tight">
            Organiza tus{' '}
            <span className="text-orange-500 font-normal relative inline-block">
              encargos
              <div className="absolute -bottom-1 sm:-bottom-2 left-0 w-full h-0.5 sm:h-1 bg-gradient-to-r from-orange-300 to-orange-500 rounded-full opacity-60"></div>
            </span>
            <br />
            <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl text-stone-600 block mt-3 sm:mt-4 md:mt-6">
              con simplicidad
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl md:text-2xl text-stone-600 mb-12 sm:mb-14 md:mb-16 max-w-2xl sm:max-w-3xl mx-auto leading-relaxed font-light px-4">
            Una plataforma elegante y minimalista para gestionar pedidos y clientes.
          </p>


          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 justify-center items-center mb-16 sm:mb-18 md:mb-20">
            <button
              onClick={handleGetStarted}
              className="group inline-flex items-center justify-center px-8 sm:px-10 md:px-12 py-4 sm:py-5 text-lg sm:text-xl font-medium text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-xl sm:rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-orange-200 w-full sm:w-auto max-w-xs sm:max-w-none"
            >
              <span className="mr-2 sm:mr-3">Comenzar</span>
              <svg 
                className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:translate-x-2" 
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
          <div className="flex justify-center pt-8">
            <button
              onClick={() => {
                const nextSection = document.querySelector('#how-it-works');
                nextSection?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="group flex flex-col items-center space-y-4 text-stone-400 hover:text-orange-500 transition-all duration-500 animate-bounce"
              style={{
                animationDuration: '3s',
                animationIterationCount: 'infinite'
              }}
            >
              <span className="text-lg font-light opacity-75 group-hover:opacity-100 transition-opacity">
                Descubre más
              </span>
              <div className="relative">
                <svg 
                  className="w-8 h-8 transform group-hover:translate-y-2 transition-transform duration-500" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
                <div className="absolute -inset-4 bg-orange-100 rounded-full opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
              </div>
            </button>
          </div>

        </div>
      </main>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 md:px-8 lg:px-12 bg-white/60 backdrop-blur-xl relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 sm:mb-18 md:mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-stone-800 mb-6 sm:mb-8 leading-tight">
              ¿Cómo funciona 
              <span className="text-orange-500 font-normal relative inline-block"> Comerzia
                <div className="absolute -bottom-0.5 sm:-bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-orange-300 to-orange-500 rounded-full opacity-50"></div>
              </span>?
            </h2>
            <p className="text-lg sm:text-xl text-stone-600 max-w-3xl sm:max-w-4xl mx-auto leading-relaxed font-light px-4">
              Una solución completa para gestionar encargos de cualquier tipo de negocio, desde el pedido hasta la entrega.
            </p>
          </div>

          {/* Process Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 md:gap-16 mb-16 sm:mb-18 md:mb-20">
            <div className="text-center group px-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg className="w-10 h-10 sm:w-12 sm:h-12 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-light text-stone-800 mb-4 sm:mb-6">1. Registra encargos</h3>
              <p className="text-base sm:text-lg text-stone-600 leading-relaxed font-light">
                Añade nuevos encargos con información del producto, proveedor, ubicación y datos del cliente
              </p>
            </div>

            <div className="text-center group px-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg className="w-10 h-10 sm:w-12 sm:h-12 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-light text-stone-800 mb-4 sm:mb-6">2. Gestiona el proceso</h3>
              <p className="text-base sm:text-lg text-stone-600 leading-relaxed font-light">
                Marca estados de pedido, recepción y entrega. Controla pagos y notifica automáticamente a clientes por email o SMS
              </p>
            </div>

            <div className="text-center group px-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg className="w-10 h-10 sm:w-12 sm:h-12 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-light text-stone-800 mb-4 sm:mb-6">3. Analiza resultados</h3>
              <p className="text-base sm:text-lg text-stone-600 leading-relaxed font-light">
                Visualiza métricas, productos más solicitados y clientes frecuentes con gráficos detallados
              </p>
            </div>
          </div>

          {/* Key Features */}
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 lg:p-12 shadow-2xl border border-stone-200">
            <h3 className="text-2xl sm:text-3xl font-light text-stone-800 mb-8 sm:mb-10 md:mb-12 text-center">Funcionalidades principales</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-10">
              <div className="flex items-start space-x-3 sm:space-x-4 group">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mt-1 sm:mt-2 flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-light text-stone-800 text-base sm:text-lg mb-1 sm:mb-2">Control de estados</h4>
                  <p className="text-stone-600 leading-relaxed text-sm sm:text-base">Pedido → Recibido → Entregado → Pagado → Cliente notificado</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 sm:space-x-4 group">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mt-1 sm:mt-2 flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-light text-stone-800 text-base sm:text-lg mb-1 sm:mb-2">Notificaciones automáticas</h4>
                  <p className="text-stone-600 leading-relaxed text-sm sm:text-base">Email y SMS cuando el pedido llega o se retrasa</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 sm:space-x-4 group">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mt-1 sm:mt-2 flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-light text-stone-800 text-base sm:text-lg mb-1 sm:mb-2">Gestión de clientes</h4>
                  <p className="text-stone-600 leading-relaxed text-sm sm:text-base">Nombre, contacto y historial de pedidos organizados</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 sm:space-x-4 group">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mt-1 sm:mt-2 flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-light text-stone-800 text-base sm:text-lg mb-1 sm:mb-2">Dashboard analítico</h4>
                  <p className="text-stone-600 leading-relaxed text-sm sm:text-base">Métricas, gráficos y análisis de tendencias</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="text-center mt-16 sm:mt-18 md:mt-20">
            <div className="bg-gradient-to-r from-stone-50 to-orange-50 rounded-2xl sm:rounded-3xl p-8 sm:p-12 md:p-16 border border-stone-200 shadow-xl">
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-light text-stone-800 mb-6 sm:mb-8">¿Necesitas esta solución para tu empresa?</h3>
              <p className="text-lg sm:text-xl text-stone-600 mb-8 sm:mb-10 md:mb-12 max-w-2xl sm:max-w-3xl mx-auto leading-relaxed font-light px-4">
                Comerzia puede adaptarse a las necesidades específicas de tu negocio. 
                Contáctanos para implementar un sistema personalizado de gestión de encargos.
              </p>
              <a 
                href="https://zonda.one" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-8 sm:px-10 py-3 sm:py-4 text-base sm:text-lg font-light text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-xl sm:rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-orange-200 w-full sm:w-auto max-w-xs sm:max-w-none"
              >
                <span className="mr-2 sm:mr-3">Contactar ZONDA</span>
                <svg 
                  className="w-4 h-4 sm:w-5 sm:h-5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white/90 backdrop-blur-xl border-t border-stone-200 py-8 sm:py-10 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
          <div className="flex flex-col md:flex-row items-center justify-between text-stone-500 space-y-3 md:space-y-0">
            <div className="text-base sm:text-lg font-light text-center md:text-left">
              © 2025 Comerzia. Simplicidad en la gestión.
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3 text-base sm:text-lg font-light">
              <span>Hecho por</span>
              <a 
                href="https://zonda.one" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-orange-600 hover:text-orange-700 font-normal transition-colors duration-300 hover:scale-105 transform"
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