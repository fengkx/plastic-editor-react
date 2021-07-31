import { useMountEffect } from "@react-hookz/web";
import produce from "immer";
import { atom } from "jotai";
import { useAtomValue } from "jotai/utils";
import { useRouter } from "next/router";
import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Block } from "../Block";
import { useAdapter } from "./adapters/AdapterContext";

export type PropsType = {
  editable?: boolean;
  initialBlockId?: string;
};

export const childrenAtom = atom((get) => {
  const { pageFamily, pageIdAtom } = useAdapter();
  const { children } = get(pageFamily({ id: get(pageIdAtom) }));
  return children;
});

export const Editor: React.FC<PropsType> = ({
  editable = true,
  initialBlockId = "",
}) => {
  const { usePage } = useAdapter();
  const [page, setPage] = usePage();
  const router = useRouter();
  useMountEffect(() => {
    console.log(router.query);
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
  const children = useAtomValue(childrenAtom);
  return (
    <div id="block-root">
      <DndProvider backend={HTML5Backend}>
        {children.map((block, index) => (
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
