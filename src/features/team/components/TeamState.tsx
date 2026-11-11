import type Ionicons from "@expo/vector-icons/Ionicons";
import type { ComponentProps } from "react";

import { StateView, type StateViewVariant } from "@/components/ui/StateView";
import type { TeamRosterStatus } from "@/features/team/hooks/useTeamRoster";

type TeamStateVariant = Exclude<TeamRosterStatus, "loading" | "ready">;

type TeamStateProps = {
  variant: TeamStateVariant;
  onRetry?: () => void;
};

const CONTENT: Record<
  TeamStateVariant,
  { kind: StateViewVariant; icon: ComponentProps<typeof Ionicons>["name"]; title: string; message: string; canRetry: boolean }
> = {
  profileError: {
    kind: "error",
    icon: "cloud-offline-outline",
    title: "Couldn't load your profile",
    message: "Check your connection and try again.",
    canRetry: true,
  },
  noDepartment: {
    kind: "empty",
    icon: "people-outline",
    title: "You're not on a team yet",
    message: "Ask an admin to assign you to a department. Pull down to check again.",
    canRetry: false,
  },
  noReports: {
    kind: "empty",
    icon: "people-outline",
    title: "No direct reports yet",
    message: "Nobody reports to you yet. Switch to Department to see your whole team, or ask an admin to set you as their manager.",
    canRetry: false,
  },
  teamError: {
    kind: "error",
    icon: "cloud-offline-outline",
    title: "Couldn't load your team",
    message: "Something went wrong reaching the server. Pull down or try again.",
    canRetry: true,
  },
};

/** Empty / error message for the team screen, using the shared StateView. */
export function TeamState({ variant, onRetry }: TeamStateProps) {
  const content = CONTENT[variant];
  return (
    <StateView
      variant={content.kind}
      icon={content.icon}
      title={content.title}
      message={content.message}
      actionLabel={content.canRetry && onRetry ? "Try again" : undefined}
      onPressAction={onRetry}
    />
  );
}
