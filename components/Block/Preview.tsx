import { Block } from "@plastic-editor/protocol/lib/protocol";
import clsx from "clsx";
import deepEqual from "fast-deep-equal/es6/react";
import { useAtomValue, useSetAtom } from "jotai";
import { nanoid } from "nanoid";
import { memo as ReactMemo, useCallback } from "react";
import { useAdapter } from "../Editor/adapters/AdapterContext";
import { Token, tokenizer } from "../Editor/parser";
import { anchorOffsetAtom, editingBlockIdAtom } from "../Editor/store";

export type PropsType = {
  blockId: string;
  className: string;
};
const PreviewImpl: React.FC<PropsType> = ({ blockId, className }) => {
  const { blockFamily, pageIdAtom } = useAdapter();
  const setAnchorOffset = useSetAtom(anchorOffsetAtom);
  const setEditingBlockId = useSetAtom(editingBlockIdAtom);
  const focusCallback = useCallback(
    (ev) => {
      ev.stopPropagation();
      setEditingBlockId(blockId);
    },
    [blockId, setEditingBlockId]
  );
  const block = useAtomValue<Block>(
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
    <>
      <style jsx>{`
        .drop-over.up {
          box-shadow: 0px -5px 0px hsl(0, 0%, 90%);
        }
        .drop-over.down {
          box-shadow: 0px 5px 0px hsl(0, 0%, 90%);
        }
      `}</style>
      <div
        className={clsx(
          "preview flex-1 cursor-text whitespace-pre-wrap",
          className
        )}
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
    </>
  );
};

export const Preview = ReactMemo(PreviewImpl, (prevProps, nextProps) =>
  deepEqual(prevProps, nextProps)
);
