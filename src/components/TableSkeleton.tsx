import React from 'react';

interface TableSkeletonProps {
  rows?: number;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({ rows = 6 }) => {
  return (
    <div 
      className="rounded-2xl overflow-hidden animate-fade-in"
      style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(255, 247, 237, 0.75) 100%)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.04), 0 4px 16px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(249, 115, 22, 0.05)'
      }}
    >
      {/* Elegant loading header */}
      <div 
        className="px-6 py-4 border-b border-white/30"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 247, 237, 0.9) 100%)',
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div 
              className="w-5 h-5 rounded-full animate-shimmer"
              style={{
                background: 'linear-gradient(90deg, rgba(249, 115, 22, 0.1) 0%, rgba(249, 115, 22, 0.3) 50%, rgba(249, 115, 22, 0.1) 100%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 2s ease-in-out infinite'
              }}
            />
            <div 
              className="h-4 w-32 rounded-lg animate-pulse-soft"
              style={{
                background: 'linear-gradient(90deg, rgba(249, 115, 22, 0.08) 0%, rgba(249, 115, 22, 0.15) 50%, rgba(249, 115, 22, 0.08) 100%)',
              }}
            />
          </div>
          <div 
            className="h-3 w-24 rounded-full animate-pulse-soft"
            style={{
              background: 'linear-gradient(90deg, rgba(249, 115, 22, 0.05) 0%, rgba(249, 115, 22, 0.12) 50%, rgba(249, 115, 22, 0.05) 100%)',
            }}
          />
        </div>
      </div>

      {/* Zen-style loading content */}
      <div className="p-6 space-y-4">
        {Array.from({ length: rows }, (_, index) => (
          <div 
            key={index}
            className="flex items-center space-x-4 animate-fade-in"
            style={{
              animationDelay: `${index * 100}ms`,
              animationFillMode: 'both'
            }}
          >
            {/* Leading element */}
            <div 
              className="w-3 h-3 rounded-full animate-pulse-soft"
              style={{
                background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.1) 0%, rgba(249, 115, 22, 0.2) 100%)',
                animationDelay: `${index * 200}ms`
              }}
            />
            
            {/* Content bars with varying widths */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center space-x-3">
                <div 
                  className="h-3 rounded-lg animate-shimmer"
                  style={{
                    width: `${60 + (index % 3) * 15}%`,
                    background: 'linear-gradient(90deg, rgba(249, 115, 22, 0.05) 0%, rgba(249, 115, 22, 0.12) 50%, rgba(249, 115, 22, 0.05) 100%)',
                    backgroundSize: '200% 100%',
                    animationDelay: `${index * 150}ms`
                  }}
                />
                <div 
                  className="h-3 w-16 rounded-lg animate-pulse-soft"
                  style={{
                    background: 'linear-gradient(90deg, rgba(249, 115, 22, 0.03) 0%, rgba(249, 115, 22, 0.08) 50%, rgba(249, 115, 22, 0.03) 100%)',
                    animationDelay: `${index * 300}ms`
                  }}
                />
              </div>
              
              {/* Secondary line */}
              <div 
                className="h-2 rounded-lg animate-shimmer"
                style={{
                  width: `${40 + (index % 4) * 10}%`,
                  background: 'linear-gradient(90deg, rgba(249, 115, 22, 0.03) 0%, rgba(249, 115, 22, 0.08) 50%, rgba(249, 115, 22, 0.03) 100%)',
                  backgroundSize: '200% 100%',
                  animationDelay: `${index * 250}ms`
                }}
              />
            </div>

            {/* Trailing elements */}
            <div className="flex items-center space-x-2">
              <div 
                className="w-2 h-2 rounded-full animate-pulse-soft"
                style={{
                  background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.2) 100%)',
                  animationDelay: `${index * 400}ms`
                }}
              />
              <div 
                className="w-2 h-2 rounded-full animate-pulse-soft"
                style={{
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.2) 100%)',
                  animationDelay: `${index * 500}ms`
                }}
              />
              <div 
                className="w-2 h-2 rounded-full animate-pulse-soft"
                style={{
                  background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.1) 0%, rgba(249, 115, 22, 0.2) 100%)',
                  animationDelay: `${index * 600}ms`
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Footer with subtle loading indicator */}
      <div 
        className="px-6 py-3 border-t border-white/20"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 247, 237, 0.8) 100%)',
        }}
      >
        <div className="flex items-center justify-center space-x-2">
          <div 
            className="w-1.5 h-1.5 rounded-full animate-float"
            style={{
              background: 'rgba(249, 115, 22, 0.3)',
              animationDelay: '0ms'
            }}
          />
          <div 
            className="w-1.5 h-1.5 rounded-full animate-float"
            style={{
              background: 'rgba(249, 115, 22, 0.3)',
              animationDelay: '200ms'
            }}
          />
          <div 
            className="w-1.5 h-1.5 rounded-full animate-float"
            style={{
              background: 'rgba(249, 115, 22, 0.3)',
              animationDelay: '400ms'
            }}
          />
          <span className="text-xs text-gray-500 ml-3 animate-pulse-soft">Cargando datos...</span>
        </div>
      </div>
    </div>
  );
};