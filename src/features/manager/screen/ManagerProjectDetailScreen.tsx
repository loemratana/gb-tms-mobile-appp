import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useRef } from "react";
import { Image, Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { getStatusColor } from "@/features/employee/helpers/helpers";
import { useProjectMembers } from "@/features/manager/hooks/useProjectMembers";
import { useProjectTaskList } from "@/features/manager/hooks/useProjectTaskList";
import { ProjectTaskCreateSheet } from "@/features/manager/components/project/ProjectTaskCreateSheet";
import type { ProjectTaskCreateSheetRef } from "@/features/manager/components/project/ProjectTaskCreateSheet";
import { getProjectStatusStyle } from "@/features/manager/utils/projectStatus";
import { buildProjectTaskCreateInput } from "@/features/manager/utils/projectTaskDefaults";
import {
  PROJECT_TASK_FILTERS,
  getProjectTaskSortLabel,
  nextProjectTaskSort,
} from "@/features/manager/utils/projectTasks";
import { useProjectsStore } from "@/stores/projectsStore";

export default function ManagerProjectDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const projects = useProjectsStore((s) => s.projects);
  const createSheetRef = useRef<ProjectTaskCreateSheetRef>(null);

  const project = useMemo(
    () => (id ? projects.find((item) => item.id === id) : undefined),
    [id, projects],
  );

  const {
    filteredTasks,
    progress,
    search,
    setSearch,
    filter,
    setFilter,
    sort,
    setSort,
    createTask,
  } = useProjectTaskList(project?.name);

  const { members, assigneeMap } = useProjectMembers(project);

  if (!project) {
    return (
      <View className="flex-1 items-center justify-center bg-[#F3F4F6] px-6">
        <Text className="text-[18px] font-semibold text-[#111827]">Project not found</Text>
      </View>
    );
  }

  const badge = getProjectStatusStyle(project.status);

  return (
    <>
      <View className="flex-1 bg-[#F3F4F6]">
        <View className="bg-white px-4 pb-4 pt-2">
          <View className="flex-row items-center justify-between">
            <Pressable onPress={() => router.back()} className="h-9 justify-center px-1">
              <Text className="text-[14px] font-semibold text-[#6B7280]">← Back</Text>
            </Pressable>
            <View className="rounded-full px-3 py-1" style={{ backgroundColor: badge.bg }}>
              <Text className="text-[12px] font-semibold" style={{ color: badge.text }}>
                {badge.label}
              </Text>
            </View>
          </View>

          <Text className="mt-1 text-[22px] font-bold text-[#111827]">{project.name}</Text>
          <Text className="mt-0.5 text-[13px] text-[#6B7280]" numberOfLines={2}>
            {project.description || "No project description"}
          </Text>

          <View className="mt-3 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="flex-row">
                {members.slice(0, 4).map((member, index) => (
                  <Image
                    key={member.id}
                    source={{ uri: member.avatarUrl }}
                    className="h-8 w-8 rounded-full border-2 border-white"
                    style={{ marginLeft: index === 0 ? 0 : -10 }}
                  />
                ))}
              </View>
              <Text className="ml-2 text-[12px] text-[#6B7280]">{members.length} members</Text>
            </View>
            <Text className="text-[12px] font-semibold text-[#16A34A]">{progress}% complete</Text>
          </View>
          <View className="mt-2 h-2 overflow-hidden rounded-full bg-[#E5E7EB]">
            <View className="h-full rounded-full bg-[#32CD32]" style={{ width: `${progress}%` }} />
          </View>
        </View>

        <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
          <View className="rounded-2xl bg-white p-4">
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="text-[18px] font-bold text-[#111827]">Tasks ({filteredTasks.length})</Text>
              <Pressable
                onPress={() => createSheetRef.current?.present()}
                className="rounded-full bg-[#32CD32] px-3 py-2"
              >
                <Text className="text-[12px] font-semibold text-white">+ New Task</Text>
              </Pressable>
            </View>

            <View className="flex-row items-center gap-2">
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search tasks..."
                placeholderTextColor="#9CA3AF"
                className="h-11 flex-1 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-3 text-[14px] text-[#111827]"
              />
              <Pressable
                onPress={() => setSort((prev) => nextProjectTaskSort(prev))}
                className="h-11 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white px-3"
              >
                <Text className="text-[12px] font-semibold text-[#6B7280]">{getProjectTaskSortLabel(sort)}</Text>
              </Pressable>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-2">
              <View className="flex-row gap-2">
                {PROJECT_TASK_FILTERS.map((item) => (
                  <Pressable
                    key={item.key}
                    onPress={() => setFilter(item.key)}
                    className={`rounded-full border px-3 py-1.5 ${
                      filter === item.key
                        ? "border-[#32CD32] bg-[#F0FDF4]"
                        : "border-[#E5E7EB] bg-white"
                    }`}
                  >
                    <Text
                      className={`text-[12px] font-semibold ${
                        filter === item.key ? "text-[#16A34A]" : "text-[#6B7280]"
                      }`}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            {filteredTasks.length === 0 ? (
              <View className="mt-4 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-8">
                <Text className="text-center text-[14px] font-medium text-[#374151]">No tasks found</Text>
                <Text className="mt-1 text-center text-[12px] text-[#9CA3AF]">
                  Create your first task or adjust search.
                </Text>
              </View>
            ) : (
              <View className="mt-4 gap-2">
                {filteredTasks.map((task) => (
                  <View
                    key={task.id}
                    className="flex-row items-start rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-3"
                  >
                    <View
                      className="mt-1 h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: getStatusColor(task.status) }}
                    />
                    <View className="ml-3 flex-1">
                      <Text className="text-[14px] font-semibold text-[#111827]">{task.title}</Text>
                      <Text className="mt-1 text-[12px] text-[#6B7280]">
                        {task.assignees[0]?.name ?? "Unassigned"}
                        {task.dueDate ? ` • Due ${task.dueDate}` : ""}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </View>

      <ProjectTaskCreateSheet
        ref={createSheetRef}
        onCreate={(values) =>
          createTask(
            buildProjectTaskCreateInput(project, values, assigneeMap.get(values.assigneeId) ?? "Unassigned"),
          )
        }
      />
    </>
  );
}
