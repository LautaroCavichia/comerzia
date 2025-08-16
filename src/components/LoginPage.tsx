import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = login(username, password);
      if (!success) {
        setError('Usuario o contraseña incorrectos');
      }
    } catch (err) {
      setError('Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-slate-50 to-stone-100 flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
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
          <g className="opacity-20">
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
          </g>
          
          {/* Zen Garden Stones */}
          <g className="opacity-40">
            {/* Large stone - bottom left */}
            <ellipse 
              cx="200" 
              cy="850" 
              rx="60" 
              ry="25" 
              fill="#b8ada3" 
              opacity="0.6"
              style={{
                animation: 'stoneGlow 40s ease-in-out infinite'
              }}
            />
            
            {/* Medium stone - top right */}
            <ellipse 
              cx="1600" 
              cy="300" 
              rx="40" 
              ry="18" 
              fill="#aca196" 
              opacity="0.5"
              style={{
                animation: 'stoneGlow 45s ease-in-out infinite',
                animationDelay: '-15s'
              }}
            />
            
            {/* Small stones scattered */}
            <ellipse cx="800" cy="400" rx="20" ry="8" fill="#b0a599" opacity="0.4"/>
            <ellipse cx="400" cy="200" rx="15" ry="6" fill="#a8a092" opacity="0.3"/>
            <ellipse cx="1200" cy="700" rx="25" ry="10" fill="#b5aa9d" opacity="0.5"/>
          </g>
          
          {/* Sparkle Sand Particles */}
          <g className="opacity-30">
            {Array.from({length: 20}).map((_, i) => {
              const x = Math.random() * 1920;
              const y = Math.random() * 1080;
              const delay = Math.random() * 15;
              return (
                <circle 
                  key={`sparkle-${i}`}
                  cx={x} 
                  cy={y} 
                  r="0.8" 
                  fill="#f4e8d8" 
                  opacity="0.6"
                  style={{
                    animation: `sparkle 8s ease-in-out infinite`,
                    animationDelay: `${delay}s`
                  }}
                />
              );
            })}
          </g>
        </svg>
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
            opacity: 0.6; 
            filter: brightness(1);
          }
          50% { 
            opacity: 0.4; 
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
      `}</style>

      <div className="max-w-md w-full space-y-6 sm:space-y-8 relative z-10">
        <div className="text-center">
          <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 bg-white/90 backdrop-blur-xl rounded-3xl flex items-center justify-center mb-6 sm:mb-8 shadow-2xl border border-stone-200">
            <img 
              src="/logo.png" 
              alt="Comerzia Logo" 
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-contain"
            />
          </div>
          <h2 className="text-3xl sm:text-4xl font-light text-stone-800 mb-3">
            Comerzia
          </h2>
          <p className="text-base sm:text-lg text-stone-600 font-light">
            Inicia sesión en tu punto de venta
          </p>
        </div>

        <div className="bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl border border-stone-200">
          <form className="space-y-5 sm:space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50/90 backdrop-blur-sm border border-red-200 rounded-xl p-4 animate-slide-down">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700 font-light">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-sm font-light text-stone-700 mb-2">
                Usuario
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-white/70 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 transition-all duration-200 font-light backdrop-blur-sm"
                placeholder="Nombre de usuario"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-light text-stone-700 mb-2">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/70 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 transition-all duration-200 font-light backdrop-blur-sm"
                placeholder="••••••••"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || !username || !password}
                className="w-full py-3 sm:py-4 text-base sm:text-lg font-light text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    <span className="font-light">Iniciando sesión...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    <span className="font-light">Iniciar Sesión</span>
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};