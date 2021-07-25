import { createContext, useContext, useEffect, useMemo } from "react";

export const PageIdContenxt = createContext("");

export function PageIdContextProvider({ children, value }) {
  return (
    <PageIdContenxt.Provider value={value}>{children}</PageIdContenxt.Provider>
  );
}

export function usePageId() {
  const ctx = useContext(PageIdContenxt);
  return ctx;
}
