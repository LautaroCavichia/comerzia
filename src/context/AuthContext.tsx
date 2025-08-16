import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  username: string;
  sellingPoint: string;
  displayName: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const ACCOUNTS = {
  [process.env.REACT_APP_ACCOUNT1_USERNAME || 'farmacia1']: {
    password: process.env.REACT_APP_ACCOUNT1_PASSWORD || 'password1',
    sellingPoint: process.env.REACT_APP_ACCOUNT1_USERNAME || 'farmacia1',
    displayName: process.env.REACT_APP_ACCOUNT1_DISPLAY_NAME || 'Farmacia Centro'
  },
  [process.env.REACT_APP_ACCOUNT2_USERNAME || 'farmacia2']: {
    password: process.env.REACT_APP_ACCOUNT2_PASSWORD || 'password2',
    sellingPoint: process.env.REACT_APP_ACCOUNT2_USERNAME || 'farmacia2',
    displayName: process.env.REACT_APP_ACCOUNT2_DISPLAY_NAME || 'Farmacia Norte'
  },
  [process.env.REACT_APP_ACCOUNT3_USERNAME || 'farmacia3']: {
    password: process.env.REACT_APP_ACCOUNT3_PASSWORD || 'password3',
    sellingPoint: process.env.REACT_APP_ACCOUNT3_USERNAME || 'farmacia3',
    displayName: process.env.REACT_APP_ACCOUNT3_DISPLAY_NAME || 'Farmacia Sur'
  },
  [process.env.REACT_APP_ACCOUNT4_USERNAME || 'farmacia4']: {
    password: process.env.REACT_APP_ACCOUNT4_PASSWORD || 'password4',
    sellingPoint: process.env.REACT_APP_ACCOUNT4_USERNAME || 'farmacia4',
    displayName: process.env.REACT_APP_ACCOUNT4_DISPLAY_NAME || 'Farmacia Cuatro'
  },
  [process.env.REACT_APP_ADMIN_USERNAME || 'admin']: {
    password: process.env.REACT_APP_ADMIN_PASSWORD || 'admin123',
    sellingPoint: process.env.REACT_APP_ADMIN_USERNAME || 'admin',
    displayName: process.env.REACT_APP_ADMIN_DISPLAY_NAME || 'Administrator'
  }
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const savedUser = localStorage.getItem('comerzia_user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem('comerzia_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (username: string, password: string): boolean => {
    const account = ACCOUNTS[username as keyof typeof ACCOUNTS];
    
    if (account && account.password === password) {
      const userData: User = {
        username,
        sellingPoint: account.sellingPoint,
        displayName: account.displayName
      };
      
      setUser(userData);
      localStorage.setItem('comerzia_user', JSON.stringify(userData));
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('comerzia_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};