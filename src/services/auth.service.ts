import type {
  AuthUser,
  LoginCredentials,
  LoginResponse,
  UserRole,
} from "@/features/auth/types/auth";
import { api, type ApiEnvelope } from "@/lib/api";

type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
};

type UserProfile = {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  role: { id: string; name: string };
};

const ROLE_PRIORITY: UserRole[] = ["ADMIN", "MANAGER", "EMPLOYEE"];

function resolvePrimaryRole(role: { name: string } | null | undefined): UserRole {
  const name = role?.name?.toUpperCase();
  return ROLE_PRIORITY.find((candidate) => candidate === name) ?? "EMPLOYEE";
}

function toAuthUser(profile: UserProfile): AuthUser {
  return {
    id: profile.id,
    name: profile.fullName,
    role: resolvePrimaryRole(profile.role),
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

export async function logout(): Promise<void> {
  await api.post("/auth/logout");
}
