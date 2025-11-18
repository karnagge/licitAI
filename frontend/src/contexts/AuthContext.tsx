import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';
import type { AuthResponseDto, LoginDto } from '@shared/types/dtos';

interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  tenantId: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginDto) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Authentication Context Provider
 * Manages user authentication state and operations
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const accessToken = localStorage.getItem('accessToken');

    if (storedUser && accessToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  /**
   * Login user with email and password
   */
  const login = async (credentials: LoginDto) => {
    try {
      const response = await api.post<AuthResponseDto>('/auth/login', credentials);
      const { accessToken, refreshToken, user } = response.data;

      // Store tokens and user
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      setUser(user);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  /**
   * Register new user and organization
   */
  const register = async (data: any) => {
    try {
      const response = await api.post<AuthResponseDto>('/auth/register', data);
      const { accessToken, refreshToken, user } = response.data;

      // Store tokens and user
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      setUser(user);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  /**
   * Logout user
   */
  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      // Clear local state regardless of API call result
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access authentication context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
