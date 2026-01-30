import { createContext, useContext } from "react";

type LogoutConfirmContextValue = {
  requestLogout: () => void;
};

const LogoutConfirmContext = createContext<LogoutConfirmContextValue | null>(
  null
);

export function LogoutConfirmProvider({
  value,
  children,
}: {
  value: LogoutConfirmContextValue;
  children: React.ReactNode;
}) {
  return (
    <LogoutConfirmContext.Provider value={value}>
      {children}
    </LogoutConfirmContext.Provider>
  );
}

export function useLogoutConfirm() {
  const ctx = useContext(LogoutConfirmContext);
  if (!ctx) {
    throw new Error(
      "useLogoutConfirm must be used within LogoutConfirmProvider"
    );
  }
  return ctx;
}
