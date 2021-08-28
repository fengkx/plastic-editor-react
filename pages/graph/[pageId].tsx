import {
  AdapterProvider,
  useAdapter,
} from "../../components/Editor/adapters/AdapterContext";
import { useCurrentPageId } from "../../components/Editor/hooks";
import { MindMap as IMindMap } from "../../components/MindMap";
import { useAtomValue } from "jotai/utils";

export default function NotePage(props) {
  const pageId = useCurrentPageId("pageId");
  if (!pageId) {
    return null;
  }
  return (
    <AdapterProvider>
      <div className="h-screen w-full">
        <MindMap />
      </div>
    </AdapterProvider>
  );
}

function MindMap() {
  const { pageFamily, pageIdAtom } = useAdapter();
  const id = useAtomValue(pageIdAtom);
  console.log(id);
  const pageContent = useAtomValue(pageFamily({ id }));
  return <IMindMap tree={pageContent} />;
}
