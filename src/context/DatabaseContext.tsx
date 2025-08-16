import React, { createContext, useContext, ReactNode } from 'react';
import { DatabaseService } from '../lib/database';
import { useAuth } from './AuthContext';

interface DatabaseContextType {
  db: DatabaseService;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

interface DatabaseProviderProps {
  children: ReactNode;
}

export const DatabaseProvider: React.FC<DatabaseProviderProps> = ({ children }) => {
  const { user } = useAuth();
  
  // Debug: Log current selling point
  console.log('Current user selling point:', user?.sellingPoint);
  
  // Create a database instance with the user's selling point
  const db = new DatabaseService(user?.sellingPoint || 'default');

  return (
    <DatabaseContext.Provider value={{ db }}>
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};