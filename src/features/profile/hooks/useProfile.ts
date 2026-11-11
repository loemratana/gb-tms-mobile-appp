import { useEffect } from "react";

import { toProfileDetails, toProfileUser, type ProfileDetail, type ProfileUser } from "@/features/profile/utils/profile";
import { useCurrentUser } from "@/features/users/hooks/useUsers";
import type { UserResponse } from "@/features/users/types/user.types";
import { useProfileStore } from "@/stores/profileStore";

type Profile = {
  currentUser: UserResponse | undefined;
  /** Live profile, or what was cached at sign-in while the first fetch runs. */
  user: ProfileUser;
  details: ProfileDetail[];
  /** True only when there's nothing at all to show yet. */
  isLoading: boolean;
  /** True only when the fetch failed and there's no cached profile to fall back on. */
  isError: boolean;
  isRefreshing: boolean;
  refetch: () => void;
};

/** The signed-in user's profile from GET /users/me, mirrored into the profile store for the tab headers. */
export function useProfile(): Profile {
  const query = useCurrentUser();
  const currentUser = query.data;
  const setProfileUser = useProfileStore((state) => state.setUser);
  const cachedUser = useProfileStore((state) => state.user);

  useEffect(() => {
    if (currentUser) setProfileUser(toProfileUser(currentUser));
  }, [currentUser, setProfileUser]);

  const user = currentUser ? toProfileUser(currentUser) : cachedUser;

  return {
    currentUser,
    user,
    details: currentUser ? toProfileDetails(currentUser) : [],
    isLoading: query.isLoading && !user.name,
    isError: query.isError && !user.name,
    isRefreshing: query.isRefetching,
    refetch: () => void query.refetch(),
  };
}
