import { create } from "zustand";


import type { LoginResponse, User } from "../types/user";

import { persist } from "zustand/middleware";

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  requires2FA: boolean;
  loginEmail: string | null;
  setRequires2FA: (val: boolean, email: string) => void;
  login: (data: LoginResponse) => void;
  verify2FA: (data: LoginResponse) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      requires2FA: false,
      loginEmail: null,
      setRequires2FA: (val, email) => set({ requires2FA: val, loginEmail: email }),
      login: (response) => {
        if (response.data.user.Is2faenabled) {
          set({ requires2FA: true, loginEmail: response.data.user.email });
        } else {
          localStorage.setItem("access_token", response.data.access_token);
          localStorage.setItem("refresh_token", response.data.refresh_token);
          set({
            user: response.data.user,
            isAuthenticated: true,
            requires2FA: false,
          });
        }
      },
      verify2FA: (response) => {
        localStorage.setItem("access_token", response.data.access_token);
        localStorage.setItem("refresh_token", response.data.refresh_token);
        set({
          user: response.data.user,
          isAuthenticated: true,
          requires2FA: false,
        });
      },
      logout: () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        set({ user: null, isAuthenticated: false, requires2FA: false, loginEmail: null });
      },
    }),
    {
      name: "event-management-user-storage",
    }
  )
);
