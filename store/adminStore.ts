import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  image?: string | null;
}

interface AdminState {
  user: AdminUser | null;
  token: string | null;
  loginTime: number | null;
  
  setAdmin: (user: AdminUser, token: string) => void; 
  logout: () => void;
  isValidSession: () => boolean;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      loginTime: null,
      
      setAdmin: (user, token) => set({ user, token, loginTime: Date.now() }),
      
      logout: () => set({ user: null, token: null, loginTime: null }),
      
      isValidSession: () => {
        const { user, token, loginTime } = get();
        if (!user || !token || !loginTime || user.role !== "ADMIN") return false;
        
        const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
        const isExpired = Date.now() - loginTime > sevenDaysInMs;
        
        return !isExpired;
      }
    }),
    {
      name: 'admin-auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export const authFetcher = async (url: string, options: RequestInit = {}) => {
  const { token, logout } = useAdminStore.getState();

  const headers = new Headers(options.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(url, { ...options, headers });

  if (res.status === 401) {
    logout();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }

  return res.json();
};