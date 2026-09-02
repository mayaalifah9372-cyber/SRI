import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { authenticateWithGoogleSheet, registerWithGoogleSheet, AuthResult, LoginParams, RegisterParams } from '../services/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isCashier: boolean;
  isAuthLoading: boolean;
  authError: string | null;
  login: (identifier: string, password?: string) => Promise<AuthResult>;
  register: (params: RegisterParams) => Promise<AuthResult>;
  loginWithPhone: (phone: string, role?: 'customer' | 'admin' | 'cashier', name?: string, password?: string) => Promise<boolean>;
  registerWithPhone: (phone: string, name: string, institution?: string, address?: string, password?: string) => Promise<boolean>;
  logout: () => void;
  openAuthModal: (mode?: 'login' | 'register', redirectAction?: () => void) => void;
  closeAuthModal: () => void;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register';
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('sri_tefa_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      localStorage.setItem('sri_tefa_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('sri_tefa_user');
    }
  }, [user]);

  const openAuthModal = (mode: 'login' | 'register' = 'login', redirectAction?: () => void) => {
    setAuthError(null);
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
    if (redirectAction) {
      setPendingAction(() => redirectAction);
    }
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setPendingAction(null);
    setAuthError(null);
  };

  const clearAuthError = () => {
    setAuthError(null);
  };

  const login = async (identifier: string, password?: string): Promise<AuthResult> => {
    setIsAuthLoading(true);
    setAuthError(null);

    try {
      const result = await authenticateWithGoogleSheet({ identifier, password });
      if (result.success && result.user) {
        setUser(result.user);
        setIsAuthModalOpen(false);
        if (pendingAction) {
          pendingAction();
          setPendingAction(null);
        }
        return result;
      } else {
        setAuthError(result.message);
        return result;
      }
    } catch (err: any) {
      const msg = err?.message || 'Terjadi kesalahan saat memverifikasi akun ke database Google Sheet.';
      setAuthError(msg);
      return { success: false, message: msg };
    } finally {
      setIsAuthLoading(false);
    }
  };

  const register = async (params: RegisterParams): Promise<AuthResult> => {
    setIsAuthLoading(true);
    setAuthError(null);

    try {
      const result = await registerWithGoogleSheet(params);
      if (result.success && result.user) {
        setUser(result.user);
        setIsAuthModalOpen(false);
        if (pendingAction) {
          pendingAction();
          setPendingAction(null);
        }
        return result;
      } else {
        setAuthError(result.message);
        return result;
      }
    } catch (err: any) {
      const msg = err?.message || 'Terjadi kesalahan saat mendaftarkan akun ke Google Sheet.';
      setAuthError(msg);
      return { success: false, message: msg };
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Backwards compatibility methods
  const loginWithPhone = async (phone: string, role?: 'customer' | 'admin' | 'cashier', _name?: string, password?: string): Promise<boolean> => {
    const res = await login(phone, password);
    return res.success;
  };

  const registerWithPhone = async (phone: string, name: string, institution?: string, address?: string, password?: string): Promise<boolean> => {
    const username = 'user_' + phone.replace(/[^0-9]/g, '').slice(-6);
    const res = await register({
      username,
      password: password || 'user123',
      name,
      phone,
      institution,
      address,
      role: 'customer',
    });
    return res.success;
  };

  const logout = () => {
    setUser(null);
    setAuthError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isCashier: user?.role === 'cashier' || user?.role === 'admin',
        isAuthLoading,
        authError,
        login,
        register,
        loginWithPhone,
        registerWithPhone,
        logout,
        openAuthModal,
        closeAuthModal,
        isAuthModalOpen,
        authModalMode,
        clearAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
