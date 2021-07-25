import clsx from "clsx";
import deepEqual from "fast-deep-equal/es6/react";
import { useAtomValue, useUpdateAtom } from "jotai/utils";
import { nanoid } from "nanoid";
import React, { useCallback } from "react";
import { blockFamily, pageIdAtom } from "../Editor/adapters/memory";
import { Token, tokenizer } from "../Editor/parser";
import { anchorOffsetAtom, editingBlockIdAtom } from "../Editor/store";

export type PropsType = {
  blockId: string;
};
const PreviewImpl: React.FC<PropsType> = ({ blockId }) => {
  const setAnchorOffset = useUpdateAtom(anchorOffsetAtom);
  const setEditingBlockId = useUpdateAtom(editingBlockIdAtom);
  const focusCallback = useCallback(
    (ev) => {
      ev.stopPropagation();
      setEditingBlockId(blockId);
    },
    [blockId, setEditingBlockId]
  );
  const block = useAtomValue(
    blockFamily({ id: blockId, pageId: useAtomValue(pageIdAtom) })
  );
  const focusTextHelper =
    (token: Token) =>
    (offset: number = 0) =>
    (ev) => {
      const selection = window.getSelection();
      setAnchorOffset((selection?.anchorOffset ?? 0) + token.position + offset);
    };
  const parsed = tokenizer(block.content, []);
  return (
    <div
      className={clsx("preview", "flex-1", "cursor-text")}
      onClick={focusCallback}
    >
      {parsed.map((token) => {
        return (
          <token.meta.component
            key={nanoid(4)}
            {...token.meta.props}
            blockId={blockId}
            focusTextHelper={focusTextHelper(token)}
          />
        );
      })}
    </div>
  );
};

export const Preview = React.memo(PreviewImpl, (prevProps, nextProps) =>
  deepEqual(prevProps, nextProps)
);
