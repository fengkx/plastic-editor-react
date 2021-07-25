import { useCurrentPageId } from "../../components/Editor/hooks";
import { Main } from "../../components/Main";

export default function NotePage(props) {
  const pageId = useCurrentPageId("pageId");
  if (!pageId) {
    return null;
  }
  return <Main />;
}
