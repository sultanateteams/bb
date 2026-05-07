import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AuthUser } from "@/types/auth";

export interface AuthStoreState {
  user: AuthUser | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
}

export interface AuthStoreActions {
  setCredentials: (payload: {
    user: AuthUser;
    token: string;
    refreshToken: string;
  }) => void;
  logout: () => void;
  updateProfile: (firstName: string, lastName: string) => void;
  changeLogin: (login: string) => void;
  changePassword: (currentPassword: string, nextPassword: string) => boolean;
}

export const useAuthStore = create<AuthStoreState & AuthStoreActions>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      setCredentials: ({ user, token, refreshToken }) =>
        set(() => ({
          user,
          token,
          refreshToken,
          isAuthenticated: true,
        })),
      logout: () =>
        set(() => {
          if (typeof window !== "undefined") {
            window.localStorage.removeItem("uz-gas-auth-v1");
            window.location.href = "/auth";
          }
          return {
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
          };
        }),
      updateProfile: (firstName, lastName) =>
        set((state) => ({
          user: state.user
            ? { ...state.user, firstName, lastName }
            : null,
        })),
      changeLogin: (login) =>
        set((state) => ({
          user: state.user ? { ...state.user, login } : null,
        })),
      changePassword: (currentPassword, nextPassword) => {
        const state = get();
        if (!state.user || state.user.password !== currentPassword) {
          return false;
        }
        set((prev) => ({
          user: prev.user ? { ...prev.user, password: nextPassword } : null,
        }));
        return true;
      },
    }),
    {
      name: "uz-gas-auth-v1",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

export const useAuth = () => useAuthStore((state) => state);

export const authStore = useAuthStore;