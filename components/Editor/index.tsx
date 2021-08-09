import { useMountEffect } from "@react-hookz/web";
import produce from "immer";
import { useRouter } from "next/router";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Block } from "../Block";
import { useAdapter } from "./adapters/AdapterContext";

export type PropsType = {
  editable?: boolean;
  initialBlockId?: string;
};

export const Editor: React.FC<PropsType> = ({
  editable = true,
  initialBlockId = "",
}) => {
  const { usePage } = useAdapter();
  const [page, setPage] = usePage();
  const router = useRouter();
  useMountEffect(() => {
    debugger;
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
