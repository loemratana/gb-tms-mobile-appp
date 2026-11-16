import { useState } from "react";

import type { TeamScopeOption } from "@/features/team/components/TeamScopeTabs";
import type { TeamScope } from "@/features/team/hooks/useTeamRoster";

import TeamScreen from "./TeamScreen";

const MANAGER_SCOPE_OPTIONS: TeamScopeOption[] = [
  { value: "directReports", label: "Direct reports", icon: "git-network-outline" },
  { value: "department", label: "Department", icon: "business-outline" },
];

/**
 * Managers default to their direct reports — the people whose tasks they can view and assign —
 * and can switch to the whole department they belong to.
 */
export default function ManagerTeamScreen() {
  const [scope, setScope] = useState<TeamScope>("directReports");

  return <TeamScreen scope={scope} scopeOptions={MANAGER_SCOPE_OPTIONS} onChangeScope={setScope} />;
}
