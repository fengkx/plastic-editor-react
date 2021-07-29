import { useSafeState } from "@react-hookz/web";
import { nanoid } from "nanoid";
import { useCallback } from "react";
import { ID_LEN } from "../components/Editor/adapters/memory";

export function useNanoid() {
  const [id, setId] = useSafeState(nanoid(ID_LEN));
  const genNewId = useCallback(() => setId(nanoid(ID_LEN)), []);
  return [id, genNewId] as const;
}
