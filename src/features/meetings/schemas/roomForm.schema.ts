import { z } from "zod";

export const ROOM_MAX_CAPACITY = 500;

export const roomFormSchema = z.object({
  name: z.string().trim().min(1, "Room name is required").max(100, "Keep the name under 100 characters"),
  code: z
    .string()
    .trim()
    .max(20, "Code is at most 20 characters")
    .regex(/^[A-Za-z0-9_-]*$/, "Use only letters, digits, - and _"),
  location: z.string().trim().max(200, "Location is at most 200 characters"),
  description: z.string().trim().max(2000, "Description is too long"),
  /** Kept as text while typing; converted to a number on submit. */
  capacity: z
    .string()
    .trim()
    .regex(/^\d+$/, "Enter the number of seats")
    .refine((value) => Number(value) >= 1 && Number(value) <= ROOM_MAX_CAPACITY, {
      message: `Capacity must be between 1 and ${ROOM_MAX_CAPACITY}`,
    }),
  status: z.enum(["ACTIVE", "MAINTENANCE", "INACTIVE"]),
  facilities: z.array(
    z.enum(["PROJECTOR", "TV", "WHITEBOARD", "VIDEO_CONFERENCE", "SPEAKERPHONE", "AIR_CONDITIONER"]),
  ),
});

export type RoomFormValues = z.infer<typeof roomFormSchema>;
