import type Ionicons from "@expo/vector-icons/Ionicons";
import type { ComponentProps } from "react";

import type { RoomFacility } from "@/features/meetings/types/meeting.types";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

export const ROOM_FACILITY_META: Record<RoomFacility, { label: string; icon: IoniconName }> = {
  PROJECTOR: { label: "Projector", icon: "easel-outline" },
  TV: { label: "TV", icon: "tv-outline" },
  WHITEBOARD: { label: "Whiteboard", icon: "clipboard-outline" },
  VIDEO_CONFERENCE: { label: "Video conference", icon: "videocam-outline" },
  SPEAKERPHONE: { label: "Speakerphone", icon: "mic-outline" },
  AIR_CONDITIONER: { label: "Air conditioner", icon: "snow-outline" },
};
