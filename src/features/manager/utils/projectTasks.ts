import type { Task } from "@/features/employee/types/types";

export type ProjectTaskFilter = "all" | "todo" | "in_progress" | "done";
export type ProjectTaskSort = "recent" | "due_asc" | "title_asc";

export const PROJECT_TASK_FILTERS: { key: ProjectTaskFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "todo", label: "To Do" },
  { key: "in_progress", label: "In Progress" },
  { key: "done", label: "Done" },
];

export function getProjectTaskSortLabel(sort: ProjectTaskSort): string {
  if (sort === "due_asc") return "Due";
  if (sort === "title_asc") return "Title";
  return "Recent";
}

export function nextProjectTaskSort(sort: ProjectTaskSort): ProjectTaskSort {
  if (sort === "recent") return "due_asc";
  if (sort === "due_asc") return "title_asc";
  return "recent";
}

function matchesProjectTaskQuery(task: Task, query: string): boolean {
  if (!query) return true;
  return (
    task.title.toLowerCase().includes(query) ||
    task.description.toLowerCase().includes(query) ||
    (task.assignees[0]?.name ?? "").toLowerCase().includes(query)
  );
}

export function filterProjectTasks(
  tasks: Task[],
  { search, filter }: { search: string; filter: ProjectTaskFilter },
): Task[] {
  const query = search.trim().toLowerCase();
  return tasks.filter((task) => {
    if (filter !== "all" && task.status !== filter) return false;
    return matchesProjectTaskQuery(task, query);
  });
}

export function sortProjectTasks(tasks: Task[], sort: ProjectTaskSort): Task[] {
  if (sort === "title_asc") return [...tasks].sort((a, b) => a.title.localeCompare(b.title));
  if (sort === "due_asc")
    return [...tasks].sort((a, b) => (a.dueDate ?? "").localeCompare(b.dueDate ?? ""));
  return [...tasks].sort((a, b) => b.id.localeCompare(a.id));
}

export function getProjectTaskProgress(tasks: Task[]): { completedCount: number; progress: number } {
  const completedCount = tasks.filter((task) => task.status === "done").length;
  const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;
  return { completedCount, progress };
}
