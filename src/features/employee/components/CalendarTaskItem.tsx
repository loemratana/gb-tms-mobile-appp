/* ============================================================
   CALENDAR TASK ITEM (used in calendar view)
   ============================================================ */
   import React from "react";
   import { View, Text, TouchableOpacity } from "react-native";
   import { Task } from "../types/types";
   import { getStatusColor, getStatusLabel } from "../helpers/helpers";
   
   interface CalendarTaskItemProps {
     task: Task;
     onPress?: (task: Task) => void;
   }
   
   export const CalendarTaskItem: React.FC<CalendarTaskItemProps> = ({ task, onPress }) => {
     const statusColor = getStatusColor(task.status);
     return (
       <TouchableOpacity
         onPress={() => onPress?.(task)}
         className="flex-row items-center p-3 bg-white rounded-xl border border-gray-200 mb-2"
       >
         <View
           className="w-1 h-10 rounded-full mr-3"
           style={{ backgroundColor: statusColor }}
         />
         <View className="flex-1">
           <Text className="text-sm font-semibold text-gray-900">{task.title}</Text>
           <Text className="text-xs text-gray-500">{task.description}</Text>
         </View>
         <View
           className="px-2 py-0.5 rounded-full"
           style={{ backgroundColor: statusColor + "20" }}
         >
           <Text className="text-xs" style={{ color: statusColor }}>
             {getStatusLabel(task.status)}
           </Text>
         </View>
       </TouchableOpacity>
     );
   };