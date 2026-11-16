import type { CreateTaskFormValues } from "@/features/tasks/schemas/createTask.schema";

type AudienceInput = {
  assignTo: CreateTaskFormValues["assignTo"];
  /** People the choice reaches (creator excluded); undefined while still counting. */
  audienceCount: number | undefined;
  isLoading: boolean;
  loadError: string | undefined;
  departmentName: string | undefined;
  positionName: string | undefined;
  positionDepartmentName: string | undefined;
};

export type AudienceSummary = { text: string; isWarning: boolean };

function plural(count: number, one: string, many = `${one}s`): string {
  return count === 1 ? one : many;
}

/** Who a "whole department" / "everyone in a position" choice reaches, said before creating. */
export function describeTaskAudience({
  assignTo,
  audienceCount,
  isLoading,
  loadError,
  departmentName,
  positionName,
  positionDepartmentName,
}: AudienceInput): AudienceSummary {
  if (loadError) return { text: loadError, isWarning: true };
  if (isLoading || audienceCount === undefined) return { text: "Counting people…", isWarning: false };

  const isDepartment = assignTo === "DEPARTMENT";
  if (audienceCount === 0) {
    return {
      text: isDepartment
        ? `${departmentName ?? "This department"} has no active members to assign.`
        : `Nobody active holds ${positionName ?? "this position"}.`,
      isWarning: true,
    };
  }

  return {
    text: isDepartment
      ? `All ${audienceCount} active ${plural(audienceCount, "member")} of ${departmentName ?? "the department"} get this task.`
      : `All ${audienceCount} active ${plural(audienceCount, "person", "people")} in ${positionName} get this task. It's filed under ${positionDepartmentName}.`,
    isWarning: false,
  };
}
