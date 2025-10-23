import React, { createContext, useContext, useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  getAuthToken,
  setAuthToken,
  removeAuthToken,
  getUserData,
  setUserData,
  removeUserData,
} from '../lib/utils/auth';

type User = Record<string, any> | null;

interface AuthContextValue {
  user: User;
  token: string | null;
  login: (user: Record<string, any>, token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(null);
  const [token, setToken] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize from centralized auth utility which uses 'authToken' key
    const storedToken = getAuthToken();
    const storedUser = getUserData();
    if (storedToken) setToken(storedToken);
    if (storedUser) setUser(storedUser);
  }, []);

  const login = (u: Record<string, any>, t: string) => {
    setUser(u);
    setToken(t);
    // persist via lib utils (keeps key consistent across codebase)
    setAuthToken(t);
    setUserData(u);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    removeAuthToken();
    removeUserData();
    // Redirect to login after clearing auth
    try {
      navigate('/login');
    } catch {
      // ignore navigation errors in non-router contexts
    }
  };

  const value: AuthContextValue = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const RequireAuth: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};
