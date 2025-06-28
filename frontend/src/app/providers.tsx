// frontend/src/app/providers.tsx
'use client';

import React, { createContext, useState, useEffect, useContext, useCallback } from 'react'; // Import useCallback
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: { name: string; role: string; email: string } | null;
  token: string | null;
  loginUser: (token: string, user: { name: string; role: string; email: string }) => void;
  logoutUser: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ name: string; role: string; email: string } | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Envolver logoutUser com useCallback para que não mude em cada renderização
  const logoutUser = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    router.push('/login');
  }, [router]); // Adicionar router como dependência do useCallback

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } catch (e) {
        console.error('Erro ao fazer parse do utilizador guardado:', e);
        logoutUser(); // Agora logoutUser está na dependência do useEffect
      }
    }
    setLoading(false);
  }, [logoutUser]); // ADICIONADO: logoutUser como dependência

  const loginUser = (newToken: string, userData: { name: string; role: string; email: string }) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ user, token, loginUser, logoutUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}