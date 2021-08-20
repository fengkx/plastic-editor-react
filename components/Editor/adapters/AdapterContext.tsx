import { createContext, useContext } from "react";
import { hasSupabase, supabase } from "../../../db";
import { memoryAdapter } from "./memory";
import { supbaseAdapter } from "./supabase";

type IAdapter = typeof memoryAdapter | typeof supbaseAdapter;
const AdapterContext = createContext<IAdapter>(memoryAdapter);

export type PropsType = {
  adapter?: IAdapter;
};
export const AdapterProvider: React.FC<PropsType> = ({ children, adapter }) => {
  if (!adapter) {
    if (hasSupabase) {
      const session = supabase.auth.session();
      console.log(session, Boolean(session));
      adapter = Boolean(session) ? supbaseAdapter : memoryAdapter;
    } else {
      adapter = memoryAdapter;
    }
  }
  return (
    <AdapterContext.Provider value={adapter}>
      {children}
    </AdapterContext.Provider>
  );
};

export function useAdapter<T extends IAdapter>() {
  return useContext(AdapterContext) as T;
}
