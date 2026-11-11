import type {
  AuthUser,
  LoginCredentials,
  LoginResponse,
  UserRole,
} from "@/features/auth/types/auth.types";
import { api, type ApiEnvelope } from "@/lib/api";

type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
};

/** The fields of GET /users/me that the session needs. */
export type UserProfile = {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  roles?: { id: string; name: string }[] | null;
};

const ROLE_PRIORITY: UserRole[] = ["ADMIN", "MANAGER", "EMPLOYEE"];

/** A user can hold several roles; the highest-privilege one picks the app area. */
function resolvePrimaryRole(roles: UserProfile["roles"]): UserRole {
  const names = new Set((roles ?? []).map((role) => role.name.toUpperCase()));
  return ROLE_PRIORITY.find((candidate) => names.has(candidate)) ?? "EMPLOYEE";
}

export function toAuthUser(profile: UserProfile): AuthUser {
  return {
    id: profile.id,
    name: profile.fullName,
    role: resolvePrimaryRole(profile.roles),
    email: profile.email,
    avatarUrl: profile.avatarUrl ?? undefined,
  };
}

export async function login(
  credentials: LoginCredentials
): Promise<LoginResponse> {
  const { data: loginEnvelope } = await api.post<ApiEnvelope<AuthTokens>>(
    "/auth/login",
    credentials
  );
  const tokens = loginEnvelope.data;

  const { data: profileEnvelope } = await api.get<ApiEnvelope<UserProfile>>(
    "/users/me",
    { headers: { Authorization: `Bearer ${tokens.accessToken}` } }
  );

  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    user: toAuthUser(profileEnvelope.data),
  };
}

/** Ends only this device's session: the backend revokes just this refresh token. */
export async function logout(refreshToken: string | null): Promise<void> {
  await api.post("/auth/logout", refreshToken ? { refreshToken } : undefined);
}

/** Revokes every active session for this account, on all devices. */
export async function logoutAll(): Promise<void> {
  await api.post("/auth/logout-all");
}

/** Emails a 6-digit reset code. The server answers the same whether or not the email exists. */
export async function requestPasswordReset(email: string): Promise<void> {
  await api.post("/auth/forgot-password", { email });
}

export type ResetPasswordInput = {
  email: string;
  code: string;
  newPassword: string;
};

/** Sets a new password with the emailed code. Signs the account out on every device. */
export async function resetPassword(input: ResetPasswordInput): Promise<void> {
  await api.post("/auth/reset-password", input);
}

export type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
};

/**
 * Changes the signed-in user's password. The server signs out every other device and
 * returns new tokens for this one, which the caller must store in place of the old ones.
 */
export async function changePassword(
  input: ChangePasswordInput
): Promise<{ accessToken: string; refreshToken: string }> {
  const { data } = await api.put<ApiEnvelope<AuthTokens>>("/users/me/password", input);
  return { accessToken: data.data.accessToken, refreshToken: data.data.refreshToken };
}
