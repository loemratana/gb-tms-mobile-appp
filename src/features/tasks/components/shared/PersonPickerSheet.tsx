import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";

import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { ModalSheet } from "@/components/ui/ModalSheet";
import type { AssigneeOption } from "@/features/tasks/types/assignee.types";
import { colors } from "@/styles";

type BaseProps = {
  visible: boolean;
  title: string;
  onClose: () => void;
  people: readonly AssigneeOption[];
  isLoading?: boolean;
  loadError?: string;
};

type SingleSelectProps = BaseProps & {
  selectionMode: "single";
  /** Shown with a check mark, e.g. the current assignee. */
  selectedId?: string;
  /** Picking a person closes the sheet; the caller decides what happens next. */
  onSelect: (id: string) => void;
};

type MultiSelectProps = BaseProps & {
  selectionMode: "multiple";
  /** Selection when the sheet opens; changes stay local until Confirm. */
  selectedIds: string[];
  onConfirm: (ids: string[]) => void;
};

type PersonPickerSheetProps = SingleSelectProps | MultiSelectProps;

/**
 * Choose one person (reassign) or several (assign a new task) from a scrollable list.
 * A sheet, not Alert.alert: a department can have dozens of members, and Alert.alert only
 * renders a handful of buttons reliably (Android caps at 3).
 */
export function PersonPickerSheet(props: PersonPickerSheetProps) {
  const { visible, title, onClose, people, isLoading = false, loadError } = props;
  const isMultiple = props.selectionMode === "multiple";
  const initialIds = isMultiple ? props.selectedIds : props.selectedId ? [props.selectedId] : [];

  const [draftIds, setDraftIds] = useState<string[]>(initialIds);
  const [wasVisible, setWasVisible] = useState(visible);
  // Re-seed the draft each time the sheet opens (adjusting state during render, not in an effect).
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) setDraftIds(initialIds);
  }

  const handlePress = (id: string) => {
    if (props.selectionMode === "single") {
      props.onSelect(id);
      return;
    }
    setDraftIds((ids) => (ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]));
  };

  const body = isLoading ? (
    <Text className="py-6 text-center text-caption text-fg-soft">Loading team members…</Text>
  ) : loadError ? (
    <Text className="py-6 text-center text-caption text-error">{loadError}</Text>
  ) : people.length === 0 ? (
    <Text className="py-6 text-center text-caption text-fg-soft">No team members found.</Text>
  ) : (
    <FlatList
      data={people}
      keyExtractor={(item) => item.id}
      style={{ maxHeight: 360 }}
      renderItem={({ item }) => {
        const isSelected = draftIds.includes(item.id);
        return (
          <Pressable
            onPress={() => handlePress(item.id)}
            accessibilityRole={isMultiple ? "checkbox" : "radio"}
            accessibilityState={isMultiple ? { checked: isSelected } : { selected: isSelected }}
            accessibilityLabel={item.name}
            className="flex-row items-center border-b border-line-soft py-3 active:bg-field"
          >
            <Avatar name={item.name} imageUrl={item.avatar} size={40} />
            <Text className="ml-3 flex-1 text-body font-medium text-fg">{item.name}</Text>
            {isMultiple ? (
              <View
                className={`h-6 w-6 items-center justify-center rounded-full border ${
                  isSelected ? "border-brand bg-brand" : "border-line-strong"
                }`}
              >
                {isSelected ? <Ionicons name="checkmark" size={14} color={colors.textInverse} /> : null}
              </View>
            ) : isSelected ? (
              <Ionicons name="checkmark" size={20} color={colors.brand} />
            ) : null}
          </Pressable>
        );
      }}
    />
  );

  return (
    <ModalSheet
      visible={visible}
      title={title}
      onClose={onClose}
      footer={
        props.selectionMode === "multiple" ? (
          <Button
            label={draftIds.length > 0 ? `Confirm (${draftIds.length})` : "Confirm"}
            onPress={() => props.onConfirm(draftIds)}
          />
        ) : undefined
      }
    >
      {body}
    </ModalSheet>
  );
}
