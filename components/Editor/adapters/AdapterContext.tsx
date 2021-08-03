import { createContext, useContext } from "react";
import { supabase } from "../../../db";
import { memoryAdapter } from "./memory";

const AdapterContext = createContext(memoryAdapter);

export type PropsType = {
  adapter: typeof memoryAdapter;
};
export const AdapterProvider: React.FC<PropsType> = ({ children }) => {
  const session = supabase.auth.session();
  // window.supabase = supabase;
  const adapter = Boolean(session) ? memoryAdapter : memoryAdapter;
  return (
    <AdapterContext.Provider value={memoryAdapter}>
      {children}
    </AdapterContext.Provider>
  );
};

export function useAdapter() {
  return useContext(AdapterContext);
}
