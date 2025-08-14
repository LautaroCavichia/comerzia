import React from 'react';
import { EncargosView } from './components/EncargosView';

function App() {
  return (
    <div className="min-h-screen bg-subtle-pattern">
      <header className="bg-header-gradient backdrop-blur-sm shadow-sm border-b border-primary-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <h1 className="text-2xl font-bold text-gray-900 bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">Comerzia</h1>
            <p className="text-sm text-primary-600/80 font-medium">Gestión de Encargos</p>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-fade-in">
        <EncargosView />
      </main>
    </div>
  );
}

export default App;
