import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserRole, UserSession } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: UserSession | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; message: string }>;
  loginWithBarcode: (barcode: string) => Promise<{ success: boolean; message: string }>;
  register: (data: any) => Promise<{ success: boolean; message: string }>;
  logout: (reason?: string) => void;
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
          if (parsed && parsed.expiresAt) {
            const message =
              parsed.role === 'ATLIT'
                ? 'Sesi masuk akun anggota telah berakhir otomatis setelah 1 jam demi keamanan. Silakan login kembali.'
                : 'Sesi masuk telah berakhir. Silakan login kembali.';
            sessionStorage.setItem('ikspi_session_expired_notice', message);
          }
        }
      }
    } catch (err) {
      console.error('Failed to restore auth session:', err);
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Active session timer: automatically logs out member accounts when the 1-hour limit is reached
  useEffect(() => {
    if (!user || !user.expiresAt) return;

    const checkExpiry = () => {
      const now = Date.now();
      if (now >= user.expiresAt) {
        const message =
          user.role === 'ATLIT'
            ? 'Sesi masuk akun anggota telah berakhir otomatis setelah 1 jam demi keamanan. Silakan login kembali.'
            : 'Sesi masuk akun telah berakhir demi keamanan. Silakan login kembali.';
        sessionStorage.setItem('ikspi_session_expired_notice', message);
        setUser(null);
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    };

    // Immediate check
    checkExpiry();

    // Set precise timeout for the exact expiry moment
    const timeLeft = user.expiresAt - Date.now();
    let timeoutId: any = null;
    if (timeLeft > 0) {
      timeoutId = setTimeout(() => {
        checkExpiry();
      }, Math.min(timeLeft, 2147483647));
    }

    // Backup interval check every 5 seconds
    const intervalId = setInterval(checkExpiry, 5000);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [user]);

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

  const loginWithBarcode = async (barcode: string) => {
    setIsLoading(true);
    try {
      const res = await api.loginWithBarcode(barcode);
      if (res.success && res.session) {
        setUser(res.session);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(res.session));
        return { success: true, message: res.message };
      }
      return { success: false, message: res.message || 'Login barcode gagal.' };
    } catch (error: any) {
      return { success: false, message: error?.message || 'Terjadi kesalahan saat memproses barcode.' };
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

  const logout = (reason?: string) => {
    if (reason) {
      sessionStorage.setItem('ikspi_session_expired_notice', reason);
    }
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
        loginWithBarcode,
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
