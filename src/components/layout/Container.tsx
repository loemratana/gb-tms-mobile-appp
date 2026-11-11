import type { PropsWithChildren } from "react";
import { View, type ViewProps } from "react-native";

type ContainerProps = PropsWithChildren<{
  className?: string;
  padded?: boolean;
}> &
  Pick<ViewProps, "style">;

/**
 * Flexible content area between the top header and bottom tabs.
 * Always use flex-1 so it fills remaining space.
 */
export function Container({
  children,
  className = "",
  padded = true,
  style,
}: ContainerProps) {
  return (
    <View
      className={`flex-1 ${padded ? "px-5" : ""} ${className}`.trim()}
      style={style}
    >
      {children}
    </View>
  );
}
