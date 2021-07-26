import { nanoid } from "nanoid";
import { useCallback, useState } from "react";
import { ID_LEN } from "../components/Editor/adapters/memory";

export function useNanoid() {
  const [id, setId] = useState(nanoid(ID_LEN));
  const genNewId = useCallback(() => setId(nanoid(ID_LEN)), []);
  return [id, genNewId] as const;
}
