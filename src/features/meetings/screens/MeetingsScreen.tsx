import { RefreshControl, ScrollView, View } from "react-native";

import { FloatingActionButton } from "@/components/navigation/FloatingActionButton";
import { FAB_SIZE } from "@/components/navigation/constants";
import { useTabBarInset } from "@/components/navigation/ModernTabBar";
import { Button } from "@/components/ui/Button";
import { StateView } from "@/components/ui/StateView";
import { RoomList } from "@/features/meetings/components/rooms/RoomList";
import { MeetingsHeader } from "@/features/meetings/components/schedule/MeetingsHeader";
import { MeetingTimeline } from "@/features/meetings/components/schedule/MeetingTimeline";
import { MeetingTimelineSkeleton } from "@/features/meetings/components/schedule/MeetingTimelineSkeleton";
import { WeekStrip } from "@/features/meetings/components/schedule/WeekStrip";
import { useMeetingsScreen } from "@/features/meetings/hooks/useMeetingsScreen";
import { formatDayHeading } from "@/features/meetings/utils/meetingTime";
import { SchedulePickerOverlay } from "@/features/tasks/hooks/useTaskSchedulePicker";

const FAB_GAP = 12;

/** Meetings tab: the selected day's meetings on a timeline, or the room list. */
export default function MeetingsScreen() {
  const tabBarInset = useTabBarInset();
  const {
    view,
    setView,
    schedule,
    rooms,
    roomSchedules,
    isRefreshingRooms,
    refetchRooms,
    canBook,
    openDatePicker,
    datePickerOverlay,
    openMeeting,
    createMeeting,
    bookRoom,
    manageRooms,
  } = useMeetingsScreen();
  const isSchedule = view === "schedule";

  const renderSchedule = () => {
    if (schedule.isLoading) return <MeetingTimelineSkeleton />;
    if (schedule.isError) {
      return (
        <StateView
          variant="error"
          title="Couldn't load meetings"
          message="Check your connection and try again."
          actionLabel="Retry"
          onPressAction={schedule.refetch}
        />
      );
    }
    return (
      <>
        {schedule.items.length === 0 ? (
          <View className="mb-2">
            <StateView
              variant="empty"
              icon="calendar-clear-outline"
              title="No meetings this day"
              message={canBook ? "Tap + to book a room." : "Meetings you're invited to will show up here."}
              isCompact
            />
          </View>
        ) : null}
        <MeetingTimeline
          bounds={schedule.bounds}
          items={schedule.items}
          nowOffset={schedule.nowOffset}
          onPressMeeting={openMeeting}
        />
      </>
    );
  };

  return (
    <View className="flex-1 bg-screen">
      <MeetingsHeader
        view={view}
        onChangeView={setView}
        subtitle={
          isSchedule
            ? schedule.isToday
              ? "Today"
              : schedule.selectedDate.getFullYear().toString()
            : `Rooms · ${schedule.isToday ? "Today" : schedule.selectedDate.getFullYear()}`
        }
        title={formatDayHeading(schedule.selectedDate)}
        onPressCalendar={openDatePicker}
      >
        {/* Both views follow the same day: meetings on it, or each room's bookings on it. */}
        <WeekStrip weekDays={schedule.weekDays} selectedDate={schedule.selectedDate} onSelectDate={schedule.selectDate} />
      </MeetingsHeader>

      <ScrollView
        className="flex-1 bg-subtle"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: tabBarInset + FAB_SIZE + FAB_GAP * 2 }}
        refreshControl={
          <RefreshControl
            refreshing={isSchedule ? schedule.isRefreshing : isRefreshingRooms}
            onRefresh={() => (isSchedule ? schedule.refetch() : refetchRooms())}
          />
        }
      >
        {isSchedule ? (
          renderSchedule()
        ) : (
          <>
            {manageRooms ? (
              <View className="mb-3 flex-row justify-end">
                <Button
                  label="Manage rooms"
                  icon="settings-outline"
                  variant="outline"
                  size="sm"
                  isFullWidth={false}
                  onPress={manageRooms}
                />
              </View>
            ) : null}
            <RoomList
            rooms={rooms.data}
            isLoading={rooms.isLoading}
            isError={rooms.isError}
            onRetry={() => void rooms.refetch()}
            onBook={bookRoom}
            schedules={roomSchedules}
            emptyMessage={manageRooms ? "Tap Manage rooms to add the first one." : undefined}
          />
          </>
        )}
      </ScrollView>

      {canBook ? (
        <View
          pointerEvents="box-none"
          className="absolute left-0 right-0 items-end px-5"
          style={{ bottom: tabBarInset + FAB_GAP, zIndex: 50 }}
        >
          <FloatingActionButton
            size={FAB_SIZE}
            onPress={createMeeting}
            onLongPress={createMeeting}
            accessibilityLabel="New meeting"
          />
        </View>
      ) : null}

      <SchedulePickerOverlay overlayProps={datePickerOverlay} />
    </View>
  );
}
