import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AuthUser {
  login: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (login: string, password: string) => boolean;
  logout: () => void;
  updateProfile: (data: { firstName: string; lastName: string }) => void;
  changeLogin: (newLogin: string) => void;
  changePassword: (current: string, next: string) => boolean;
}

const DEFAULT_USER: AuthUser = {
  login: "admin",
  password: "admin123",
  firstName: "Admin",
  lastName: "Foydalanuvchi",
  role: "CEO",
};

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      login: (login, password) => {
        const stored = get().user ?? DEFAULT_USER;
        const candidate: AuthUser = get().user ? stored : DEFAULT_USER;
        if (login.trim() === candidate.login && password === candidate.password) {
          set({ user: candidate, isAuthenticated: true });
          return true;
        }
        return false;
      },
      logout: () => set({ isAuthenticated: false }),
      updateProfile: ({ firstName, lastName }) => {
        const u = get().user;
        if (!u) return;
        set({ user: { ...u, firstName, lastName } });
      },
      changeLogin: (newLogin) => {
        const u = get().user;
        if (!u) return;
        set({ user: { ...u, login: newLogin } });
      },
      changePassword: (current, next) => {
        const u = get().user;
        if (!u) return false;
        if (u.password !== current) return false;
        set({ user: { ...u, password: next } });
        return true;
      },
    }),
    { name: "bb-auth" },
  ),
);
