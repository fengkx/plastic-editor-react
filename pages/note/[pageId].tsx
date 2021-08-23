import { AdapterProvider } from "../../components/Editor/adapters/AdapterContext";
import { memoryAdapter } from "../../components/Editor/adapters/memory";
import { useCurrentPageId } from "../../components/Editor/hooks";
import { Main } from "../../components/Main";

export default function NotePage() {
  const pageId = useCurrentPageId("pageId");
  if (!pageId) {
    return null;
  }
  return (
    <AdapterProvider>
      <Main />
    </AdapterProvider>
  );
}
