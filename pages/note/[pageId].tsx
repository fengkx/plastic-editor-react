import { AdapterProvider } from "../../components/Editor/adapters/AdapterContext";
import { memoryAdapter } from "../../components/Editor/adapters/memory";
import { useCurrentPageId } from "../../components/Editor/hooks";
import { MindMap } from "../../components/MindMap";

export default function NotePage(props) {
  const pageId = useCurrentPageId("pageId");
  if (!pageId) {
    return null;
  }
  return (
    <AdapterProvider>
      <MindMap />
    </AdapterProvider>
  );
}
