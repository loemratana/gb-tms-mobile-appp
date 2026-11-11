import { useRouter } from "expo-router";
import { FlatList, RefreshControl, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { Button } from "@/components/ui/Button";
import { ChipRow } from "@/components/ui/ChipRow";
import { SearchInput } from "@/components/ui/SearchInput";
import { SkeletonBlock } from "@/components/ui/Skeleton";
import { StateView } from "@/components/ui/StateView";
import { RoomAdminRow } from "@/features/meetings/components/admin/RoomAdminRow";
import { useRoomManagement } from "@/features/meetings/hooks/useRoomManagement";

/** Admin list of every meeting room (any status) with search, status filter and "Add room". */
export default function RoomManagementScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const management = useRoomManagement();

  const renderEmpty = () => {
    if (management.isLoading) {
      return (
        <View className="gap-3">
          {[0, 1, 2, 3].map((row) => (
            <SkeletonBlock key={row} height={90} radius={16} />
          ))}
        </View>
      );
    }
    if (management.isError) {
      return (
        <StateView
          variant="error"
          title="Couldn't load rooms"
          message="Check your connection and try again."
          actionLabel="Retry"
          onPressAction={management.refetch}
        />
      );
    }
    if (management.totalCount === 0) {
      return (
        <StateView
          variant="empty"
          icon="business-outline"
          title="No rooms yet"
          message="Add your first meeting room so people can book it."
          actionLabel="Add room"
          onPressAction={management.addRoom}
        />
      );
    }
    return (
      <StateView
        variant="empty"
        icon="search-outline"
        title="No rooms match"
        message="Try another name or status."
        isCompact
      />
    );
  };

  return (
    <View className="flex-1 bg-subtle">
      <ScreenHeader
        title="Rooms"
        subtitle={`${management.totalCount} ${management.totalCount === 1 ? "room" : "rooms"}`}
        onBack={() => router.back()}
        actions={<Button label="Add room" icon="add" size="sm" isFullWidth={false} onPress={management.addRoom} />}
      >
        <SearchInput
          value={management.query}
          onChangeText={management.setQuery}
          placeholder="Search name, code or location"
          accessibilityLabel="Search rooms"
        />
        <View className="-mx-4 mt-3">
          <ChipRow
            options={management.statusOptions}
            active={management.statusFilter}
            onChange={management.setStatusFilter}
            hasDots
          />
        </View>
      </ScreenHeader>

      <FlatList
        data={management.isLoading || management.isError ? [] : management.rooms}
        keyExtractor={(room) => room.id}
        renderItem={({ item }) => <RoomAdminRow room={item} onPress={management.openRoom} />}
        ItemSeparatorComponent={() => <View className="h-3" />}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24, flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        refreshControl={<RefreshControl refreshing={management.isRefreshing} onRefresh={management.refetch} />}
      />
    </View>
  );
}
