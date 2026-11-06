import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserRole, UserSession } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: UserSession | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (data: any) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  updateUserSession: (updates: Partial<UserSession>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'ikspi_kediri_session';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize session from storage
  useEffect(() => {
    try {
      const savedSession = localStorage.getItem(AUTH_STORAGE_KEY);
      if (savedSession) {
        const parsed: UserSession = JSON.parse(savedSession);
        // Verify expiry
        if (parsed.expiresAt && parsed.expiresAt > Date.now()) {
          setUser(parsed);
        } else {
          localStorage.removeItem(AUTH_STORAGE_KEY);
        }
      }
    } catch (err) {
      console.error('Failed to restore auth session:', err);
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.login(username, password);
      if (res.success && res.session) {
        setUser(res.session);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(res.session));
        return { success: true, message: res.message };
      }
      return { success: false, message: res.message || 'Login gagal.' };
    } catch (error: any) {
      return { success: false, message: error?.message || 'Terjadi kesalahan jaringan.' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: any) => {
    try {
      return await api.registerAthlete(data);
    } catch (error: any) {
      return { success: false, message: error?.message || 'Pendaftaran gagal diproses.' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const updateUserSession = (updates: Partial<UserSession>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
  };

  const refreshProfile = async () => {
    if (!user) return;
    try {
      const res = await api.getDashboard(user);
      if (res.athlete) {
        const updated = {
          ...user,
          namaLengkap: res.athlete.namaLengkap,
          unitRanting: res.athlete.unitRanting,
          nomorInduk: res.athlete.nomorInduk,
          fotoUrl: res.athlete.fotoUrl,
          angkatan: res.athlete.angkatan,
          niw: res.athlete.niw,
          nik: res.athlete.nik,
          telepon: res.athlete.nomorWhatsApp,
        };
        setUser(updated);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
      }
    } catch (err) {
      console.error('Error refreshing profile:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshProfile,
        updateUserSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
