import { useSyncExternalStore } from "react";

export interface AuthUser {
  login: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
}

const DEFAULT_USER: AuthUser = {
  login: "admin",
  password: "testtest",
  firstName: "Admin",
  lastName: "Foydalanuvchi",
  role: "CEO",
};

const STORAGE_KEY = "bb-auth-v1";

interface AuthData {
  user: AuthUser;
  isAuthenticated: boolean;
}

function load(): AuthData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { user: DEFAULT_USER, isAuthenticated: false };
}

let state: AuthData = load();
const listeners = new Set<() => void>();

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}
function emit() {
  persist();
  listeners.forEach((l) => l());
}

export const authStore = {
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  getSnapshot() {
    return state;
  },
  login(login: string, password: string): boolean {
    if (login.trim() === state.user.login && password === state.user.password) {
      state = { ...state, isAuthenticated: true };
      emit();
      return true;
    }
    return false;
  },
  logout() {
    state = { ...state, isAuthenticated: false };
    emit();
  },
  updateProfile(firstName: string, lastName: string) {
    state = { ...state, user: { ...state.user, firstName, lastName } };
    emit();
  },
  changeLogin(newLogin: string) {
    state = { ...state, user: { ...state.user, login: newLogin } };
    emit();
  },
  changePassword(current: string, next: string): boolean {
    if (state.user.password !== current) return false;
    state = { ...state, user: { ...state.user, password: next } };
    emit();
    return true;
  },
};

export function useAuth() {
  return useSyncExternalStore(authStore.subscribe, authStore.getSnapshot, authStore.getSnapshot);
}
