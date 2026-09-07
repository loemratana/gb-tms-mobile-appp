import { z } from "zod";

export const editProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(50, "Full name is too long"),
  email: z.string().trim().email("Enter a valid email address"),
  avatarUrl: z.string().min(1, "Avatar is required"),
});

export type EditProfileFormValues = z.infer<typeof editProfileSchema>;
