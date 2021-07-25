import React, { useEffect, useMemo } from "react";
import { usePageId } from "../Main/PageIdContext";
import { atom, useAtom } from "jotai";
import { selectAtom, useAtomValue, useUpdateAtom } from "jotai/utils";
import { pageFamily, pageIdAtom, usePage } from "./adapters/memory";
import { Block } from "../Block";
import { editingBlockIdAtom } from "./store";
import { useMountEffect } from "@react-hookz/web";
import { useRouter } from "next/router";
import produce from "immer";

export type PropsType = {
  editable?: boolean;
  initialBlockId?: string;
};

export const childrenAtom = atom((get) => {
  const { children } = get(pageFamily({ id: get(pageIdAtom) }));
  return children;
});

export const Editor: React.FC<PropsType> = ({
  editable = true,
  initialBlockId = "",
}) => {
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
      {children.map((block, index) => (
        <Block
          key={block.id}
          path={[index]}
          shllowBlock={block}
          pageId={page.id}
          initEditable={editable}
          initialBlockId={initialBlockId}
        />
      ))}
    </div>
  );
};
