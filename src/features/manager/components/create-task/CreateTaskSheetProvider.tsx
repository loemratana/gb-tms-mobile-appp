import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  type ReactNode,
} from "react";

import {
  CreateTaskBottomSheet,
  type CreateTaskBottomSheetRef,
} from "@/features/manager/components/create-task/CreateTaskBottomSheet";

type CreateTaskSheetContextValue = {
  open: () => void;
  close: () => void;
};

const CreateTaskSheetContext = createContext<CreateTaskSheetContextValue | null>(
  null
);

export function CreateTaskSheetProvider({ children }: { children: ReactNode }) {
  const sheetRef = useRef<CreateTaskBottomSheetRef>(null);

  const open = useCallback(() => {
    sheetRef.current?.present();
  }, []);

  const close = useCallback(() => {
    sheetRef.current?.dismiss();
  }, []);

  const value = useMemo(() => ({ open, close }), [open, close]);

  return (
    <CreateTaskSheetContext.Provider value={value}>
      {children}
      <CreateTaskBottomSheet ref={sheetRef} />
    </CreateTaskSheetContext.Provider>
  );
}

export function useCreateTaskSheet() {
  const context = useContext(CreateTaskSheetContext);
  if (!context) {
    throw new Error("useCreateTaskSheet must be used within CreateTaskSheetProvider");
  }
  return context;
}
