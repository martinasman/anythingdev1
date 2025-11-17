import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { UserProfile } from "@/types/user";

interface UserStore {
  user: UserProfile | null;
  credits: number;
  isLoading: boolean;

  setUser: (user: UserProfile | null) => void;
  setCredits: (credits: number) => void;
  deductCredits: (amount: number) => void;
  addCredits: (amount: number) => void;
  setLoading: (isLoading: boolean) => void;

  reset: () => void;
}

const initialState = {
  user: null,
  credits: 100,
  isLoading: false,
};

export const useUserStore = create<UserStore>()(
  devtools((set) => ({
    ...initialState,

    setUser: (user) =>
      set({ user, credits: user?.credits ?? initialState.credits }),

    setCredits: (credits) => set({ credits }),

    deductCredits: (amount) =>
      set((state) => ({ credits: Math.max(0, state.credits - amount) })),

    addCredits: (amount) =>
      set((state) => ({ credits: state.credits + amount })),

    setLoading: (isLoading) => set({ isLoading }),

    reset: () => set(initialState),
  }))
);
