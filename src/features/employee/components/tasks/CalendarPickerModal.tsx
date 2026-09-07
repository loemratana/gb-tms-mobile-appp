import { X } from "lucide-react-native";
import { Modal, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { Calendar, type DateData } from "react-native-calendars";
import { FullWindowOverlay } from "react-native-screens";

import { colors, componentRadius } from "@/styles";

type CalendarPickerModalProps = {
  visible: boolean;
  title: string;
  selectedDate: string | null;
  onSelect: (date: string) => void;
  onClose: () => void;
};

/**
 * A focused, on-demand calendar surface — kept out of the main filter sheet
 * so picking a custom date doesn't force the sheet itself to grow tall.
 */
export function CalendarPickerModal({
  visible,
  title,
  selectedDate,
  onSelect,
  onClose,
}: CalendarPickerModalProps) {
  const content = (
    <>
      <Pressable
        style={styles.backdrop}
        onPress={onClose}
        accessibilityLabel="Close calendar"
      />
      <View style={styles.centerWrap} pointerEvents="box-none">
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <Pressable
              onPress={onClose}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Close"
              style={styles.closeButton}
            >
              <X size={16} color={colors.textSecondary} strokeWidth={2.2} />
            </Pressable>
          </View>

          <Calendar
            current={selectedDate ?? undefined}
            onDayPress={(day: DateData) => onSelect(day.dateString)}
            markedDates={
              selectedDate
                ? { [selectedDate]: { selected: true, selectedColor: colors.primary } }
                : undefined
            }
            theme={{
              todayTextColor: colors.primary,
              arrowColor: colors.primary,
              textDayFontWeight: "500",
              textMonthFontWeight: "700",
              textDayHeaderFontWeight: "600",
            }}
            style={styles.calendar}
          />
        </View>
      </View>
    </>
  );

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      {Platform.OS === "ios" ? <FullWindowOverlay>{content}</FullWindowOverlay> : content}
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
  },
  centerWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    borderRadius: componentRadius.card,
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    marginBottom: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
  },
  closeButton: {
    height: 30,
    width: 30,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: componentRadius.avatar,
    backgroundColor: colors.mutedBg,
  },
  calendar: {
    borderRadius: componentRadius.card,
  },
});
