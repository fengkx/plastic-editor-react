import { useMountEffect } from "@react-hookz/web";
import { produce } from "immer";
import { useRouter } from "next/router";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Block } from "../Block";
import { useAdapter } from "./adapters/AdapterContext";
import { useSetAtom } from "jotai";

export type PropsType = {
  editable?: boolean;
  initialBlockId?: string;
};

export const Editor: React.FC<PropsType> = ({
  editable = true,
  initialBlockId = "",
}) => {
  const { usePage, pageIdAtom } = useAdapter();
  const setPageId = useSetAtom(pageIdAtom);
  const [page, setPage] = usePage();
  const router = useRouter();
  useMountEffect(() => {
    if (router.query.title) {
      const title = Array.isArray(router.query.title)
        ? router.query.title[0]
        : router.query.title;
      setPage(
        produce(page, (draft) => {
          page.title = title;
        })
      );
    }
    setPage(page);
    router.beforePopState((nextState) => {
      if (nextState.url === "/note/[pageId]") {
        const pageId = nextState?.as?.match?.(/note\/([^\/]+)(?:\/.+)*/)?.[1];
        if (pageId) {
          setPageId(pageId);
        }
      }
      return true;
    });
  });
  return (
    <div id="block-root">
      <DndProvider backend={HTML5Backend}>
        {page.children.map((block, index) => (
          <Block
            key={block.id}
            path={[index]}
            shallowBlock={block}
            pageId={page.id}
            initEditable={editable}
          />
        ))}
      </DndProvider>
    </div>
  );
};
