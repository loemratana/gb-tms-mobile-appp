import { useState } from "react";

import type { SegmentOption } from "@/components/ui/SegmentedControl";
import type { TeamScope } from "@/features/team/hooks/useTeamRoster";

import TeamScreen from "./TeamScreen";

const MANAGER_SCOPE_OPTIONS: SegmentOption<TeamScope>[] = [
  { value: "directReports", label: "Direct reports" },
  { value: "department", label: "Department" },
];

/**
 * Managers default to their direct reports — the people whose tasks they can view and assign —
 * and can switch to the whole department they belong to.
 */
export default function ManagerTeamScreen() {
  const [scope, setScope] = useState<TeamScope>("directReports");

  return <TeamScreen scope={scope} scopeOptions={MANAGER_SCOPE_OPTIONS} onChangeScope={setScope} />;
}
