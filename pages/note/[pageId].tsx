import { useCurrentPageId } from "../../components/Editor/hooks";
import { Main } from "../../components/Main";
import { createContext, useMemo } from "react";
import { PageIdContextProvider } from "../../components/Main/PageIdContext";

export default function NotePage(props) {
  const pageId = useCurrentPageId("pageId");
  if (!pageId) {
    return null;
  }
  return <Main />;
}
