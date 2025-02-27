
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Lista de usuários válidos
const VALID_USERS: User[] = [
  { id: '1', name: 'GABRIEL', role: 'admin' },
  { id: '2', name: 'JAILTON', role: 'admin' },
  { id: '3', name: 'EDUARDO', role: 'admin' },
];

// Senha padrão para todos os usuários
const DEFAULT_PASSWORD = '123456';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  // Carrega usuário do localStorage ao iniciar
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = (username: string, password: string): boolean => {
    // Valida username e senha
    const foundUser = VALID_USERS.find(u => 
      u.name.toLowerCase() === username.toLowerCase());
    
    if (foundUser && password === DEFAULT_PASSWORD) {
      setUser(foundUser);
      localStorage.setItem('currentUser', JSON.stringify(foundUser));
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isAuthenticated: !!user 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
