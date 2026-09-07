import { create } from "zustand";

import {
  defaultProfileUser,
  type ProfileUser,
} from "@/features/employee/data/profile";

type ProfileState = {
  user: ProfileUser;
  updateUser: (patch: Partial<ProfileUser>) => void;
  setUser: (user: ProfileUser) => void;
};

export const useProfileStore = create<ProfileState>((set) => ({
  user: defaultProfileUser,
  updateUser: (patch) =>
    set((state) => ({
      user: { ...state.user, ...patch },
    })),
  setUser: (user) => set({ user }),
}));
