import { z } from "zod";

/** Mirrors the server's `UserUpdateRequest.phoneNumber` pattern so a bad number fails here, not on save. */
const PHONE_PATTERN = /^\+?[0-9 ()-]{6,20}$/;

export const editProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(50, "Full name is too long"),
  email: z.string().trim().email("Enter a valid email address"),
  phoneNumber: z
    .string()
    .trim()
    .refine((value) => value === "" || PHONE_PATTERN.test(value), "Enter a valid phone number"),
  /** Empty when the user has no photo; a local file uri after picking a new one. */
  avatarUrl: z.string(),
});

export type EditProfileFormValues = z.infer<typeof editProfileSchema>;
