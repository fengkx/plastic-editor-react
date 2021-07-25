import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

export function useCurrentPageId(key: string) {
  const router = useRouter();
  const [result, setResult] = useState(router.query[key]);
  let id = router.query[key];
  if (Array.isArray(id)) {
    [id] = id;
  }
  useEffect(() => {
    setResult(id);
  }, [id]);
  return result;
}
