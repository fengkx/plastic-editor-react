import { createContext, useContext, useState, useEffect } from "react";
import { hasSupabase, supabase } from "../../../db";
import { memoryAdapter } from "./memory";
import { supbaseAdapter } from "./supabase";

type IAdapter = typeof memoryAdapter | typeof supbaseAdapter;
const AdapterContext = createContext<IAdapter>(memoryAdapter);

export type PropsType = {
  adapter?: IAdapter;
};
export function getParameterByName(name: string, url?: string): string | null {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&#]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return "";
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

export const AdapterProvider: React.FC<PropsType> = ({ children, adapter }) => {
  if (!adapter) {
    if (hasSupabase) {
      const access_token =
        typeof window !== "undefined" && getParameterByName("access_token");
      if (access_token) {
        supabase.auth.setAuth(access_token);
      }
      const session = supabase.auth.session();
      console.log(session, Boolean(session));
      adapter = Boolean(session) ? supbaseAdapter : memoryAdapter;
    } else {
      adapter = memoryAdapter;
    }
  }
  const [adapterState, setAdapterState] = useState<IAdapter>(adapter);

  useEffect(() => {
    if (hasSupabase) {
      const session = supabase.auth.session();
      const adapter = Boolean(session) ? supbaseAdapter : memoryAdapter;
      setAdapterState(adapter);
    }
  });
  return (
    <AdapterContext.Provider value={adapterState}>
      {children}
    </AdapterContext.Provider>
  );
};

export function useAdapter<T extends IAdapter>() {
  return useContext(AdapterContext) as T;
}
