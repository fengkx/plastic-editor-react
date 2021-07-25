import clsx from "clsx";
import React, { useCallback } from "react";
import {
  anchorOffsetAtom,
  editingBlockIdAtom,
  LINE_HEIGHT_ATOM,
} from "../Editor/store";
import { useAtomValue, useUpdateAtom } from "jotai/utils";
import { tokenizer } from "../Editor/parser";
import { blockFamily, pageIdAtom } from "../Editor/adapters/memory";
import { nanoid } from "nanoid";
import deepEqual from "fast-deep-equal/es6/react";

export type PropsType = {
  blockId: string;
};
const PreviewImpl: React.FC<PropsType> = ({ blockId }) => {
  const setAnchorOffset = useUpdateAtom(anchorOffsetAtom);
  const setEditingBlockId = useUpdateAtom(editingBlockIdAtom);
  const focusCallback = useCallback(
    (ev) => {
      setAnchorOffset(
        Math.floor((ev.clientX - ev.target.getBoundingClientRect().x) / 8)
      );
      setEditingBlockId(blockId);
    },
    [blockId, setEditingBlockId, setAnchorOffset]
  );
  const block = useAtomValue(
    blockFamily({ id: blockId, pageId: useAtomValue(pageIdAtom) })
  );
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
          />
        );
      })}
    </div>
  );
};

export const Preview = React.memo(PreviewImpl, (prevProps, nextProps) =>
  deepEqual(prevProps, nextProps)
);
