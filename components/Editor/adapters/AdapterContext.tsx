import { createContext, useContext } from "react";
import { memoryAdapter } from "./memory";

const AdapterContext = createContext(memoryAdapter);

export type PropsType = {
  adapter: typeof memoryAdapter;
};
export const AdapterProvider: React.FC<PropsType> = ({ adapter, children }) => {
  return (
    <AdapterContext.Provider value={adapter}>
      {children}
    </AdapterContext.Provider>
  );
};

export function useAdapter() {
  return useContext(AdapterContext);
}
